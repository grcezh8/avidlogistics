using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Application.Interfaces
{
    public interface ISealRepository
    {
        Task<Seal?> GetByIdAsync(int id);
        Task<List<Seal>> GetAllAsync();
        Task AddAsync(Seal seal);
        Task UpdateAsync(Seal seal);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(string sealNumber);
        Task<int> SaveAsync(Seal seal);
        Task<Seal?> GetBySealNumberAsync(string sealNumber);
        Task<List<Seal>> GetByStatusAsync(SealStatus status);
        Task<List<Seal>> GetByElectionIdAsync(int electionId);
    }
}
