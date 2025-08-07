using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface ICoCFormStatusRepository
    {
        Task<int> SaveAsync(CoCFormStatus formStatus);
        Task<CoCFormStatus?> GetByIdAsync(int formStatusId);
        Task<CoCFormStatus?> GetByManifestIdAsync(int manifestId);
        Task<CoCFormStatus?> GetByFormUrlAsync(string formUrl);
        Task<bool> UpdateAsync(CoCFormStatus formStatus);
        Task<bool> DeleteAsync(int formStatusId);
        Task<IEnumerable<CoCFormStatus>> GetByStatusAsync(string status);
        Task<IEnumerable<CoCFormStatus>> GetExpiredFormsAsync();
        Task<IEnumerable<CoCFormStatus>> GetUnresolvedFormsAsync();
        Task<IEnumerable<CoCFormStatus>> GetAllAsync();
    }
}
