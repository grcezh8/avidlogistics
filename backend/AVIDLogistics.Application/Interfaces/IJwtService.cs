using System.Security.Claims;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(int userId, string username, string role);
        ClaimsPrincipal? ValidateToken(string token);
    }
}