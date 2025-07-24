using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManifestsController : ControllerBase
    {
        private readonly ManifestRepository _manifestRepository;

        public ManifestsController(ManifestRepository manifestRepository)
        {
            _manifestRepository = manifestRepository;
        }

        /// <summary>
        /// Get manifests by election ID
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetManifests([FromQuery] int? electionId = null)
        {
            try
            {
                IEnumerable<Manifest> manifests;
                
                if (electionId.HasValue)
                {
                    manifests = await _manifestRepository.GetByElectionIdAsync(electionId.Value);
                }
                else
                {
                    manifests = await _manifestRepository.GetByStatusAsync(ManifestStatus.Draft);
                }
                
                return Ok(manifests);
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
                var manifest = await _manifestRepository.GetByIdAsync(id);
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
        public async Task<IActionResult> CreateManifest([FromBody] CreateManifestDto request)
        {
            try
            {
                var manifest = new Manifest(request.ElectionId, request.FromFacilityId, request.ToFacilityId, 1); // Default createdBy = 1
                var manifestId = await _manifestRepository.SaveAsync(manifest);
                var createdManifest = await _manifestRepository.GetByIdAsync(manifestId);
                
                return CreatedAtAction(nameof(GetManifest), new { id = manifestId }, createdManifest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateManifestDto
    {
        public int ElectionId { get; set; }
        public int FromFacilityId { get; set; }
        public int ToFacilityId { get; set; }
    }
}
