using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IKitRepository
    {
        Task<Kit?> GetByIdAsync(int id);
        Task<IEnumerable<Kit>> GetAllAsync();
        Task AddAsync(Kit kit);
        Task UpdateAsync(Kit kit);
        Task DeleteAsync(int id);
    }
}
