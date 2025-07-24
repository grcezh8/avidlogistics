using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IChainOfCustodyRepository
    {
        Task<ChainOfCustodyEvent?> GetByIdAsync(int id);
        Task<List<ChainOfCustodyEvent>> GetAllAsync();
        Task AddAsync(ChainOfCustodyEvent custodyEvent);
        Task UpdateAsync(ChainOfCustodyEvent custodyEvent);
        Task DeleteAsync(int id);

        Task<int> SaveAsync(ChainOfCustodyEvent chainEvent);
        Task<List<ChainOfCustodyEvent>> GetByAssetIdAsync(int assetId);
        Task<List<ChainOfCustodyEvent>> GetByElectionIdAsync(int electionId);
    }
}
