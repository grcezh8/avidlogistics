using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Infrastructure.Data;
using System.Security.Cryptography;
using System.Text;

namespace AVIDLogistics.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly WarehouseDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthService(WarehouseDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<string> AuthenticateAsync(string username, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
            if (user == null || !VerifyPassword(password, user.PasswordHash)) return null;

            return _jwtService.GenerateToken(user.Id, user.Username, user.Role);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            // Use proper hashing algorithm in production (e.g. BCrypt)
            var sha = SHA256.Create();
            var computedHash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(password)));
            return computedHash == hashedPassword;
        }
    }
}
