using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SealsController : ControllerBase
    {
        private readonly SealRepository _sealRepository;

        public SealsController(SealRepository sealRepository)
        {
            _sealRepository = sealRepository;
        }

        /// <summary>
        /// Get all seals
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSeals([FromQuery] string? status = null)
        {
            try
            {
                IEnumerable<Seal> seals;
                
                if (!string.IsNullOrEmpty(status) && Enum.TryParse<SealStatus>(status, out var sealStatus))
                {
                    seals = await _sealRepository.GetByStatusAsync(sealStatus);
                }
                else
                {
                    seals = await _sealRepository.GetByStatusAsync(SealStatus.Available);
                }
                
                return Ok(seals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get seal by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSeal(int id)
        {
            try
            {
                var seal = await _sealRepository.GetByIdAsync(id);
                if (seal == null)
                {
                    return NotFound(new { message = "Seal not found" });
                }

                return Ok(seal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new seal
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSeal([FromBody] CreateSealDto request)
        {
            try
            {
                var seal = new Seal(request.SealNumber, request.ElectionId);
                var sealId = await _sealRepository.SaveAsync(seal);
                var createdSeal = await _sealRepository.GetByIdAsync(sealId);
                
                return CreatedAtAction(nameof(GetSeal), new { id = sealId }, createdSeal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateSealDto
    {
        public string SealNumber { get; set; } = string.Empty;
        public int ElectionId { get; set; }
    }
}
