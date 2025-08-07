using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IKitRepository
    {
        Task<Kit?> GetByIdAsync(int id);
        Task<Kit?> GetByIdWithAssetsAsync(int id);
        Task<IEnumerable<Kit>> GetAllAsync();
        Task<IEnumerable<Kit>> GetByStatusAsync(KitStatus status);
        Task<IEnumerable<Kit>> GetByStatusWithAssetsAsync(KitStatus status);
        Task AddAsync(Kit kit);
        Task UpdateAsync(Kit kit);
        Task DeleteAsync(int id);
    }
}
