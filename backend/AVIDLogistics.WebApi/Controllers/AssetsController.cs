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
        public async Task<IActionResult> GetAssets([FromQuery] string? status = null)
        {
            try
            {
                IEnumerable<Asset> assets;
                
                if (!string.IsNullOrEmpty(status) && Enum.TryParse<AssetStatus>(status, out var assetStatus))
                {
                    assets = await _assetRepository.GetByStatusAsync(assetStatus);
                }
                else
                {
                    assets = await _assetRepository.GetAvailableAssetsAsync();
                }
                
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
                var asset = new Asset(request.SerialNumber, request.AssetType);
                if (!string.IsNullOrEmpty(request.Barcode))
                {
                    asset.Register(request.Barcode, request.RfidTag);
                }
                
                var assetId = await _assetRepository.SaveAsync(asset);
                var createdAsset = await _assetRepository.GetByIdAsync(assetId);
                
                return CreatedAtAction(nameof(GetAsset), new { id = assetId }, createdAsset);
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
        public string SerialNumber { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? RfidTag { get; set; }
    }
}
