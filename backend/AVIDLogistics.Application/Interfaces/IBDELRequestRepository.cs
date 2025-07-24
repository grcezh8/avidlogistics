using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IBDELRequestRepository
    {
        Task<BDELRequest?> GetByIdAsync(int id);
        Task<IEnumerable<BDELRequest>> GetAllAsync();
        Task AddAsync(BDELRequest request);
        Task UpdateAsync(BDELRequest request);
        Task DeleteAsync(int id);
        Task<int> SaveAsync(BDELRequest request);
    }
}
