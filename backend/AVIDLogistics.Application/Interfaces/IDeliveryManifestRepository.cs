using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IDeliveryManifestRepository
    {
        Task<DeliveryManifest?> GetByIdAsync(int id);
        Task<List<DeliveryManifest>> GetAllAsync();
        Task AddAsync(DeliveryManifest manifest);
        Task UpdateAsync(DeliveryManifest manifest);
        Task DeleteAsync(int id);
    }
}
