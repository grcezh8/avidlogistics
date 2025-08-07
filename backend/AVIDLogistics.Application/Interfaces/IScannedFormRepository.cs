using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IScannedFormRepository
    {
        Task<int> SaveAsync(ScannedForm scannedForm);
        Task<ScannedForm?> GetByIdAsync(int scannedFormId);
        Task<IEnumerable<ScannedForm>> GetByElectionIdAsync(int electionId);
        Task<IEnumerable<ScannedForm>> GetByAssetIdAsync(int assetId);
        Task<IEnumerable<ScannedForm>> GetByFormTypeAsync(string formType);
        Task UpdateAsync(ScannedForm scannedForm);
        Task DeleteAsync(int scannedFormId);
    }
}
