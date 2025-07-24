using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IPollSiteRepository
    {
        Task<PollSite?> GetByIdAsync(int id);
        Task<List<PollSite>> GetAllAsync();
        Task AddAsync(PollSite site);
        Task UpdateAsync(PollSite site);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(string SiteNumber);
        Task<int> SaveAsync(PollSite site);
    }
}
