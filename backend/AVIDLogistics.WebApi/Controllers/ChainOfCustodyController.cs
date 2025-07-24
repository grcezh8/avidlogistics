using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChainOfCustodyController : ControllerBase
    {
        private readonly ChainOfCustodyRepository _chainOfCustodyRepository;

        public ChainOfCustodyController(ChainOfCustodyRepository chainOfCustodyRepository)
        {
            _chainOfCustodyRepository = chainOfCustodyRepository;
        }

        /// <summary>
        /// Get chain of custody events
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetChainOfCustodyEvents([FromQuery] int? electionId = null, [FromQuery] int? assetId = null)
        {
            try
            {
                IEnumerable<ChainOfCustodyEvent> events;
                
                if (electionId.HasValue)
                {
                    events = await _chainOfCustodyRepository.GetByElectionIdAsync(electionId.Value);
                }
                else if (assetId.HasValue)
                {
                    events = await _chainOfCustodyRepository.GetByAssetIdAsync(assetId.Value);
                }
                else
                {
                    // Return empty list if no filters provided
                    events = new List<ChainOfCustodyEvent>();
                }
                
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get chain of custody event by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetChainOfCustodyEvent(int id)
        {
            try
            {
                var custodyEvent = await _chainOfCustodyRepository.GetByIdAsync(id);
                if (custodyEvent == null)
                {
                    return NotFound(new { message = "Chain of custody event not found" });
                }

                return Ok(custodyEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new chain of custody event
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateChainOfCustodyEvent([FromBody] CreateChainOfCustodyDto request)
        {
            try
            {
                var custodyEvent = new ChainOfCustodyEvent(
                    request.ElectionId, 
                    request.AssetId, 
                    request.FromParty, 
                    request.ToParty, 
                    request.SealNumber, 
                    1, // Default createdBy = 1
                    request.Notes
                );
                
                var eventId = await _chainOfCustodyRepository.SaveAsync(custodyEvent);
                var createdEvent = await _chainOfCustodyRepository.GetByIdAsync(eventId);
                
                return CreatedAtAction(nameof(GetChainOfCustodyEvent), new { id = eventId }, createdEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateChainOfCustodyDto
    {
        public int ElectionId { get; set; }
        public int AssetId { get; set; }
        public string FromParty { get; set; } = string.Empty;
        public string ToParty { get; set; } = string.Empty;
        public string? SealNumber { get; set; }
        public string? Notes { get; set; }
    }
}
