using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IAuditSessionRepository
    {
        Task<AuditSession?> GetByIdAsync(int id);
        Task<List<AuditSession>> GetAllAsync();
        Task AddAsync(AuditSession session);
        Task UpdateAsync(AuditSession session);
        Task DeleteAsync(int id);
        Task<int> SaveAsync(AuditSession session);
    }
}
