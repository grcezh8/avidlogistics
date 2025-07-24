using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IElectionRepository
    {
        Task<Election?> GetByIdAsync(int id);
        Task<List<Election>> GetAllAsync();
        Task AddAsync(Election election);
        Task UpdateAsync(Election election);
        Task DeleteAsync(int id);
        Task<int> SaveAsync(Election election);
        Task<List<Election>> GetUpcomingAsync();
    }
}
