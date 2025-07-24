using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Application.UseCases;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FacilitiesController : ControllerBase
    {
        private readonly FacilityService _facilityService;

        public FacilitiesController(FacilityService facilityService)
        {
            _facilityService = facilityService;
        }

        /// <summary>
        /// Get all active facilities
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Facility>>> GetFacilities()
        {
            try
            {
                var facilities = await _facilityService.GetAllActiveFacilitiesAsync();
                return Ok(facilities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving facilities", error = ex.Message });
            }
        }

        /// <summary>
        /// Get facility by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Facility>> GetFacility(int id)
        {
            try
            {
                var facility = await _facilityService.GetFacilityByIdAsync(id);
                if (facility == null)
                    return NotFound(new { message = $"Facility {id} not found" });

                return Ok(facility);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving facility", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new facility
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult<int>> CreateFacility([FromBody] CreateFacilityRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var input = new CreateFacilityInput(request.Name, request.Address, request.ContactInfo);
                var facilityId = await _facilityService.CreateFacilityAsync(input, userId);

                return CreatedAtAction(nameof(GetFacility), new { id = facilityId }, new { facilityId });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating facility", error = ex.Message });
            }
        }

        /// <summary>
        /// Update facility information
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult> UpdateFacility(int id, [FromBody] UpdateFacilityRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var input = new UpdateFacilityInput(id, request.Name, request.Address, request.ContactInfo);
                await _facilityService.UpdateFacilityAsync(input, userId);

                return Ok(new { message = "Facility updated successfully" });
            }
            catch (FacilityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating facility", error = ex.Message });
            }
        }

        /// <summary>
        /// Deactivate a facility
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeactivateFacility(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _facilityService.DeactivateFacilityAsync(id, userId);

                return Ok(new { message = "Facility deactivated successfully" });
            }
            catch (FacilityNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deactivating facility", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            // Extract user ID from JWT token claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                return userId;
            
            throw new UnauthorizedAccessException("User ID not found in token");
        }
    }

    // Request DTOs
    public class CreateFacilityRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ContactInfo { get; set; } = string.Empty;
    }

    public class UpdateFacilityRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ContactInfo { get; set; } = string.Empty;
    }
}
