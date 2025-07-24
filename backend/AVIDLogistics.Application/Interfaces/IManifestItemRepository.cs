using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IManifestItemRepository
    {
        Task<ManifestItem?> GetByIdAsync(int id);
        Task<IEnumerable<ManifestItem>> GetAllByManifestIdAsync(int manifestId);
        Task AddAsync(ManifestItem item);
        Task UpdateAsync(ManifestItem item);
        Task DeleteAsync(int id);
    }
}
