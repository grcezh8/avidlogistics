using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly AssetRepository _assetRepository;

        public AssetsController(AssetRepository assetRepository)
        {
            _assetRepository = assetRepository;
        }

        /// <summary>
        /// Get all assets
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAssets([FromQuery] string? status = null, [FromQuery] int? facilityId = null)
        {
            try
            {
                var assets = await _assetRepository.GetAllAsync();
                return Ok(assets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get asset by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsset(int id)
        {
            try
            {
                var asset = await _assetRepository.GetByIdAsync(id);
                if (asset == null)
                {
                    return NotFound(new { message = "Asset not found" });
                }

                return Ok(asset);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get asset by serial number
        /// </summary>
        [HttpGet("serial/{serialNumber}")]
        public async Task<IActionResult> GetAssetBySerialNumber(string serialNumber)
        {
            try
            {
                var asset = await _assetRepository.GetBySerialNumberAsync(serialNumber);
                if (asset == null)
                {
                    return NotFound(new { message = "Asset not found" });
                }

                return Ok(asset);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new asset
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateAsset([FromBody] CreateAssetDto request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.assetType))
                {
                    return BadRequest(new { message = "Asset type is required" });
                }

                if (string.IsNullOrWhiteSpace(request.serialNumber))
                {
                    return BadRequest(new { message = "Serial number is required" });
                }

                // Check if serial number already exists
                if (await _assetRepository.ExistsAsync(request.serialNumber))
                {
                    return BadRequest(new { message = $"Asset with serial number '{request.serialNumber}' already exists" });
                }

                // Check if RFID tag already exists (only if provided)
                if (!string.IsNullOrWhiteSpace(request.rfidTag))
                {
                    var existingAssetWithRfid = await _assetRepository.GetByRfidTagAsync(request.rfidTag);
                    if (existingAssetWithRfid != null)
                    {
                        return BadRequest(new { message = $"Asset with RFID tag '{request.rfidTag}' already exists (Asset ID: {existingAssetWithRfid.Id})" });
                    }
                }

                // Parse condition enum
                AssetCondition condition = AssetCondition.New;
                if (!string.IsNullOrWhiteSpace(request.condition))
                {
                    if (!Enum.TryParse<AssetCondition>(request.condition, true, out condition))
                    {
                        return BadRequest(new { message = $"Invalid condition: {request.condition}" });
                    }
                }

                // Handle quantity for bulk creation
                var createdAssets = new List<object>();
                
                for (int i = 0; i < Math.Max(1, request.quantity); i++)
                {
                    string serialNumber = request.serialNumber;
                    string? barcode = request.barcode;
                    
                    // For multiple quantities, append suffix to serial number and barcode
                    if (request.quantity > 1)
                    {
                        serialNumber = $"{request.serialNumber}-{(i + 1):D3}";
                        if (!string.IsNullOrWhiteSpace(request.barcode))
                        {
                            barcode = $"{request.barcode}-{(i + 1):D3}";
                        }
                    }

                    // Check if this serial number already exists (for bulk creation)
                    if (await _assetRepository.ExistsAsync(serialNumber))
                    {
                        return BadRequest(new { message = $"Asset with serial number '{serialNumber}' already exists" });
                    }

                    // Create asset using the updated factory method
                    var asset = Asset.CreateNew(
                        assetType: request.assetType,
                        serialNumber: serialNumber,
                        barcode: barcode, // Pass the barcode directly - CreateNew will handle null values
                        rfidTag: request.rfidTag, // CreateNew will auto-generate if null/empty
                        location: request.location,
                        facilityId: request.facilityId
                    );

                    // Update condition if specified
                    if (condition != AssetCondition.New)
                    {
                        asset.UpdateCondition(condition);
                    }

                    // Save to repository
                    var assetId = await _assetRepository.SaveAsync(asset);
                    var createdAsset = await _assetRepository.GetByIdAsync(assetId);
                    
                    createdAssets.Add(new
                    {
                        Id = createdAsset.Id,
                        SerialNumber = createdAsset.SerialNumber,
                        AssetType = createdAsset.AssetType,
                        Barcode = createdAsset.Barcode,
                        RfidTag = createdAsset.RfidTag,
                        Status = createdAsset.Status.ToString(),
                        Condition = createdAsset.Condition.ToString(),
                        Location = createdAsset.Location,
                        FacilityId = createdAsset.FacilityId,
                        RegisteredDate = createdAsset.RegisteredDate
                    });
                }

                // Return single asset or array based on quantity
                if (request.quantity <= 1)
                {
                    var singleAsset = createdAssets.First();
                    return CreatedAtAction(nameof(GetAsset), new { id = ((dynamic)singleAsset).Id }, singleAsset);
                }
                else
                {
                    return Ok(new { 
                        message = $"Successfully created {createdAssets.Count} assets",
                        assets = createdAssets 
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update asset status
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAssetStatus(int id, [FromBody] UpdateStatusDto request)
        {
            try
            {
                var asset = await _assetRepository.GetByIdAsync(id);
                if (asset == null)
                {
                    return NotFound(new { message = "Asset not found" });
                }

                // Update status based on the enum value
                switch ((AssetStatus)request.Status)
                {
                    case AssetStatus.Available:
                        asset.ReturnToWarehouse();
                        break;
                    case AssetStatus.Pending:
                        asset.AssignToManifest();
                        break;
                    case AssetStatus.Unavailable:
                        asset.Deploy("Poll Site");
                        break;
                    default:
                        return BadRequest(new { message = $"Invalid status: {request.Status}" });
                }

                await _assetRepository.UpdateAsync(asset);
                return Ok(new { message = "Asset status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update asset condition
        /// </summary>
        [HttpPut("{id}/condition")]
        public async Task<IActionResult> UpdateAssetCondition(int id, [FromBody] UpdateConditionDto request)
        {
            try
            {
                var asset = await _assetRepository.GetByIdAsync(id);
                if (asset == null)
                {
                    return NotFound(new { message = "Asset not found" });
                }

                // Parse condition enum
                if (!Enum.TryParse<AssetCondition>(request.Condition, true, out var condition))
                {
                    return BadRequest(new { message = $"Invalid condition: {request.Condition}" });
                }

                asset.UpdateCondition(condition);
                await _assetRepository.UpdateAsync(asset);

                return Ok(new { 
                    message = "Asset condition updated successfully",
                    condition = condition.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    // Simple DTOs for the API
    public class CreateAssetDto
    {
        public string serialNumber { get; set; } = string.Empty;
        public string assetType { get; set; } = string.Empty;
        public string? barcode { get; set; }
        public string? rfidTag { get; set; }
        public int quantity { get; set; } = 1;
        public string condition { get; set; } = "New";
        public string location { get; set; } = "Warehouse";
        public int? facilityId { get; set; }
        public string? notes { get; set; }
    }

    public class UpdateStatusDto
    {
        public int Status { get; set; }
    }

    public class UpdateConditionDto
    {
        public string Condition { get; set; } = string.Empty;
    }
}
