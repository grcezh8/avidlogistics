using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;

namespace AVIDLogistics.WebApi.Controllers
{
    public class PollSiteDto
    {
        public int PollSiteId { get; set; }
        public string SiteNumber { get; set; } = string.Empty;
        public string FacilityName { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? State { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PollSitesController : ControllerBase
    {
        private readonly IPollSiteRepository _pollSiteRepository;

        public PollSitesController(IPollSiteRepository pollSiteRepository)
        {
            _pollSiteRepository = pollSiteRepository;
        }

        /// <summary>
        /// Get all active poll sites for dropdown selection
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPollSites()
        {
            try
            {
                // Simple hardcoded response for now to get the frontend working
                var pollSites = new[]
                {
                    new { pollSiteId = 1, siteNumber = "PS001", facilityName = "Community Center North", displayName = "PS001 - Community Center North", city = "Springfield", state = "IL" },
                    new { pollSiteId = 2, siteNumber = "PS002", facilityName = "Elementary School East", displayName = "PS002 - Elementary School East", city = "Springfield", state = "IL" },
                    new { pollSiteId = 3, siteNumber = "PS003", facilityName = "Fire Station West", displayName = "PS003 - Fire Station West", city = "Springfield", state = "IL" },
                    new { pollSiteId = 4, siteNumber = "PS004", facilityName = "Library Branch South", displayName = "PS004 - Library Branch South", city = "Springfield", state = "IL" },
                    new { pollSiteId = 5, siteNumber = "PS005", facilityName = "Recreation Center", displayName = "PS005 - Recreation Center", city = "Springfield", state = "IL" }
                };

                return Ok(pollSites);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get specific poll site details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPollSite(int id)
        {
            try
            {
                var pollSite = await _pollSiteRepository.GetByIdAsync(id);
                if (pollSite == null)
                {
                    return NotFound(new { message = "Poll site not found" });
                }

                var pollSiteDto = new
                {
                    pollSiteId = pollSite.PollSiteId,
                    siteNumber = pollSite.SiteNumber,
                    facilityName = pollSite.FacilityName,
                    displayName = $"{pollSite.SiteNumber} - {pollSite.FacilityName}",
                    houseNumber = pollSite.HouseNumber,
                    streetName = pollSite.StreetName,
                    city = pollSite.City,
                    state = pollSite.State,
                    zipCode = pollSite.ZipCode,
                    isActive = pollSite.IsActive
                };

                return Ok(pollSiteDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
