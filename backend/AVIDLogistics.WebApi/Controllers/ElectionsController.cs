using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElectionsController : ControllerBase
    {
        private readonly ElectionRepository _electionRepository;

        public ElectionsController(ElectionRepository electionRepository)
        {
            _electionRepository = electionRepository;
        }

        /// <summary>
        /// Get all elections
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetElections()
        {
            try
            {
                var elections = await _electionRepository.GetUpcomingAsync();
                return Ok(elections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get election by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetElection(int id)
        {
            try
            {
                var election = await _electionRepository.GetByIdAsync(id);
                if (election == null)
                {
                    return NotFound(new { message = "Election not found" });
                }

                return Ok(election);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new election
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateElection([FromBody] CreateElectionDto request)
        {
            try
            {
                var election = new Election(request.Name, request.ElectionDate, request.ElectionType, 1); // Default createdBy = 1
                var electionId = await _electionRepository.SaveAsync(election);
                var createdElection = await _electionRepository.GetByIdAsync(electionId);
                
                return CreatedAtAction(nameof(GetElection), new { id = electionId }, createdElection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    // Simple DTOs for the API
    public class CreateElectionDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime ElectionDate { get; set; }
        public string ElectionType { get; set; } = string.Empty;
    }
}
