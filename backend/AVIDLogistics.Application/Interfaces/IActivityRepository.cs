using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IActivityRepository
    {
        Task<Activity?> GetByIdAsync(int id);
        Task<List<Activity>> GetAllAsync();
        Task AddAsync(Activity activity);
        Task UpdateAsync(Activity activity);
        Task DeleteAsync(int id);
        Task<int> SaveAsync(Activity activity);
    }
}
