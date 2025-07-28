using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Infrastructure.Data; // Change this namespace if WarehouseDbContext is elsewhere
using Microsoft.EntityFrameworkCore;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly WarehouseDbContext _context;

        public HealthController(WarehouseDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Simple health check to test database connectivity.
        /// </summary>
        [HttpGet("dbstatus")]
        public IActionResult CheckDb()
        {
            try
            {
                bool canConnect = _context.Database.CanConnect();
                return Ok(new { databaseConnected = canConnect });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { databaseConnected = false, error = ex.Message });
            }
        }
    }
}
