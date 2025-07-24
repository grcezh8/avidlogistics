using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IScannedFormRepository
    {
        Task<ScannedForm> GetByIdAsync(int scannedFormId);
        Task<List<ScannedForm>> GetAllAsync();
        Task<List<ScannedForm>> GetByElectionIdAsync(int electionId);
        Task<List<ScannedForm>> GetByAssetIdAsync(int assetId);
        Task<int> SaveAsync(ScannedForm scannedForm);
        Task AddAsync(ScannedForm scannedForm);
        Task UpdateAsync(ScannedForm scannedForm);
        Task DeleteAsync(int scannedFormId);
    }
}
