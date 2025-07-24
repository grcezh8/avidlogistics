using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IReportingRepository
    {
        Task<Report?> GetByIdAsync(int id);
        Task<List<Report>> GetAllAsync();
        Task AddAsync(Report report);
        Task UpdateAsync(Report report);
        Task DeleteAsync(int id);
        Task<List<InventoryStatusReport>> GetInventoryStatusByFacilityAsync(int? facilityId);
        Task<List<SealUsageReport>> GetSealUsageByElectionAsync(int? electionId);
        Task<List<ChainOfCustodyReport>> GetChainOfCustodyLogAsync(int? electionId = null, int? assetId = null);
        Task<List<AssetStatusReport>> GetAssetStatusReportAsync(int? facilityId = null);
        Task<List<ManifestStatusReport>> GetManifestStatusReportAsync(int? electionId = null);
    }
}
