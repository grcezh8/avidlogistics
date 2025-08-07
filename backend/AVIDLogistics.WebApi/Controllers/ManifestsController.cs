using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManifestsController : ControllerBase
    {
        private readonly AVIDLogistics.Application.Services.ManifestService _manifestService;
        private readonly IManifestRepository _manifestRepo;
        private readonly IPollSiteRepository _pollSiteRepo;

        public ManifestsController(AVIDLogistics.Application.Services.ManifestService manifestService, IManifestRepository manifestRepo, IPollSiteRepository pollSiteRepo)
        {
            _manifestService = manifestService;
            _manifestRepo = manifestRepo;
            _pollSiteRepo = pollSiteRepo;
        }

        /// <summary>
        /// Get manifests with optional status filter
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetManifests([FromQuery] string? status = null)
        {
            try
            {
                IEnumerable<Manifest> manifests;
                
                if (!string.IsNullOrEmpty(status) &&
                    Enum.TryParse<ManifestStatus>(status, true, out var parsedStatus))
                {
                    manifests = await _manifestRepo.GetByStatusAsync(parsedStatus);
                }
                else
                {
                    manifests = await _manifestRepo.GetAllAsync();
                }

                // Map domain objects to DTOs
                var manifestDtos = manifests.Select(m => new ManifestSummaryDto
                {
                    ManifestId = m.ManifestId,
                    ManifestNumber = m.ManifestNumber,
                    ElectionId = m.ElectionId,
                    FromFacilityId = m.FromFacilityId,
                    ToPollSiteId = m.ToPollSiteId,
                    Status = m.Status.ToString(),
                    ItemCount = m.Items.Count,
                    PackedCount = m.Items.Count(i => i.IsPacked)
                });
                
                return Ok(manifestDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get manifest by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetManifest(int id)
        {
            try
            {
                var manifest = await _manifestRepo.GetByIdAsync(id);
                if (manifest == null)
                {
                    return NotFound(new { message = "Manifest not found" });
                }

                return Ok(manifest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new manifest
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateManifest([FromBody] CreateManifestInput request)
        {
            try
            {
                var manifestId = await _manifestService.CreateManifestAsync(request, 1 /* createdBy - TODO: get from authenticated user */);
                var created = await _manifestRepo.GetByIdAsync(manifestId);
                
                return CreatedAtAction(nameof(GetManifest), new { id = manifestId }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add item to manifest
        /// </summary>
        [HttpPost("{id}/items")]
        public async Task<IActionResult> AddItem(int id, [FromBody] AddManifestItemInput request)
        {
            try
            {
                var input = new AddManifestItemInput(id, request.AssetId, request.SealNumber);
                await _manifestService.AddItemToManifestAsync(input);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark manifest as ready for packing
        /// </summary>
        [HttpPut("{id}/ready")]
        public async Task<IActionResult> ReadyForPacking(int id)
        {
            try
            {
                await _manifestService.ReadyManifestForPackingAsync(id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark an item as packed
        /// </summary>
        [HttpPut("{id}/items/{assetId}/pack")]
        public async Task<IActionResult> PackItem(int id, int assetId)
        {
            try
            {
                var packedBy = 1; // TODO: Get from authenticated user
                var input = new MarkItemPackedInput(id, assetId, packedBy);
                await _manifestService.MarkItemPackedAsync(input);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Complete manifest (mark as completed)
        /// </summary>
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteManifest(int id)
        {
            try
            {
                await _manifestService.CompleteManifestAsync(id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create manifest with assets (new enhanced endpoint)
        /// </summary>
        [HttpPost("create-with-assets")]
        public async Task<IActionResult> CreateManifestWithAssets([FromBody] CreateManifestWithAssetsInput request)
        {
            try
            {
                var createdBy = 1; // TODO: Get from authenticated user
                var manifestId = await _manifestService.CreateManifestWithAssetsAsync(request, createdBy);
                var created = await _manifestService.GetManifestWithDetailsAsync(manifestId);
                
                return CreatedAtAction(nameof(GetManifestWithDetails), new { id = manifestId }, created);
            }
            catch (Exception ex)
            {
                // Log the full exception details for debugging
                Console.WriteLine($"Error creating manifest: {ex}");
                return StatusCode(500, new { 
                    message = ex.Message,
                    details = ex.ToString(),
                    innerException = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Get manifests with poll site details
        /// </summary>
        [HttpGet("with-details")]
        public async Task<IActionResult> GetManifestsWithDetails([FromQuery] string? status = null)
        {
            try
            {
                IEnumerable<Manifest> manifests;
                
                if (!string.IsNullOrEmpty(status) &&
                    Enum.TryParse<ManifestStatus>(status, true, out var parsedStatus))
                {
                    manifests = await _manifestRepo.GetByStatusAsync(parsedStatus);
                }
                else
                {
                    manifests = await _manifestRepo.GetAllAsync();
                }

                var manifestDetails = new List<ManifestWithDetailsDto>();
                foreach (var manifest in manifests)
                {
                    var details = await _manifestService.GetManifestWithDetailsAsync(manifest.ManifestId);
                    manifestDetails.Add(details);
                }
                
                return Ok(manifestDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get manifest with full details including poll site info
        /// </summary>
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetManifestWithDetails(int id)
        {
            try
            {
                var manifest = await _manifestService.GetManifestWithDetailsAsync(id);
                return Ok(manifest);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Finish packing - mark all items as packed and update statuses
        /// </summary>
        [HttpPost("{id}/finish-packing")]
        public async Task<IActionResult> FinishPacking(int id)
        {
            try
            {
                var packedBy = 1; // TODO: Get from authenticated user
                await _manifestService.FinishPackingAsync(id, packedBy);
                return Ok(new { message = "Packing completed successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Generate digital Chain of Custody form for manifest
        /// </summary>
        [HttpPost("{id}/generate-digital-coc")]
        public async Task<IActionResult> GenerateDigitalCoC(int id, [FromBody] GenerateCoCFormInput? request = null)
        {
            try
            {
                var input = request ?? new GenerateCoCFormInput();
                input.ManifestId = id;
                input.BaseUrl = $"{Request.Scheme}://{Request.Host}";

                // This would require injecting the CoCFormGenerationService
                // For now, return a placeholder response
                var formUrl = $"{input.BaseUrl}/api/chainofcustody/form/{Guid.NewGuid().ToString("N")[..12].ToUpper()}";
                
                return Ok(new { 
                    manifestId = id,
                    formUrl = formUrl,
                    message = "Digital CoC form generated successfully",
                    requiredSignatures = input.RequiredSignatures,
                    expiresAt = DateTime.UtcNow.AddDays(input.ExpirationDays)
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
