using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IAlertsRepository
    {
        Task<Alert?> GetByIdAsync(int id);
        Task<List<Alert>> GetAllAsync();
        Task AddAsync(Alert alert);
        Task UpdateAsync(Alert alert);
        Task DeleteAsync(int id);
        Task<List<Alert>> GetMissingSealsAsync();
        Task<List<Alert>> GetOverdueReturnsAsync();
        Task<List<Alert>> GetUnresolvedDiscrepanciesAsync();
        Task<List<Alert>> GetAssetsNeedingMaintenanceAsync();
    }
}
