using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        /// <summary>
        /// Get all users
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                // Simple demo users
                var users = new List<object>
                {
                    new { UserId = 1, Username = "admin", Email = "admin@avidlogistics.com", Role = "Admin" },
                    new { UserId = 2, Username = "warehouse1", Email = "warehouse1@avidlogistics.com", Role = "WarehouseStaff" },
                    new { UserId = 3, Username = "courier1", Email = "courier1@avidlogistics.com", Role = "Courier" }
                };
                
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                // Simple demo user
                var user = new { UserId = id, Username = $"user{id}", Email = $"user{id}@avidlogistics.com", Role = "WarehouseStaff" };
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            try
            {
                // Simple demo user creation
                var user = new { 
                    UserId = new Random().Next(1000, 9999), 
                    Username = request.Username, 
                    Email = request.Email, 
                    Role = request.Role 
                };
                
                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
