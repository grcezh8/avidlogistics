using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IFacilityRepository
    {
        Task<Facility?> GetByIdAsync(int id);
        Task<List<Facility>> GetAllAsync();
        Task AddAsync(Facility facility);
        Task UpdateAsync(Facility facility);
        Task DeleteAsync(int id);

        Task<bool> ExistsAsync(string name);
        Task<int> SaveAsync(Facility facility);
        Task<List<Facility>> GetAllActiveAsync();
    }
}
