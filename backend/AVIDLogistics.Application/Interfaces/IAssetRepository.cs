using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IAssetRepository
    {
        Task<Asset?> GetByIdAsync(int id);
        Task<IEnumerable<Asset>> GetAllAsync();
        Task AddAsync(Asset asset);
        Task UpdateAsync(Asset asset);
        Task DeleteAsync(int id);
        Task<Asset?> GetByBarcodeAsync(string barcode);

        Task<bool> ExistsAsync(string serialNumber);
        Task<Asset?> GetBySerialNumberAsync(string serialNumber);
    }
}
