using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class AssetRepository : IAssetRepository
    {
        private readonly WarehouseDbContext _context;

        public AssetRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Asset> GetByIdAsync(int id)
        {
            return await _context.Assets
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Asset>> GetAllAsync()
        {
            return await _context.Assets
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Asset asset)
        {
            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();
            return asset.Id;
        }

        public async Task UpdateAsync(Asset asset)
        {
            _context.Assets.Update(asset);
            await _context.SaveChangesAsync();
        }

        public async Task<Asset> GetBySerialNumberAsync(string serialNumber)
        {
            return await _context.Assets
                .FirstOrDefaultAsync(a => a.SerialNumber == serialNumber);
        }

        public async Task<Asset> GetByBarcodeAsync(string barcode)
        {
            return await _context.Assets
                .FirstOrDefaultAsync(a => a.Barcode == barcode);
        }

        public async Task<Asset> GetByRfidTagAsync(string rfidTag)
        {
            return await _context.Assets
                .FirstOrDefaultAsync(a => a.RfidTag == rfidTag);
        }

        public async Task<List<Asset>> GetByStatusAsync(AssetStatus status)
        {
            return await _context.Assets
                .Where(a => a.Status == status)
                .OrderBy(a => a.SerialNumber)
                .ToListAsync();
        }

        public async Task<List<Asset>> GetAvailableAssetsAsync()
        {
            return await _context.Assets
                .Where(a => a.Status == AssetStatus.Available)
                .OrderBy(a => a.AssetType)
                .ThenBy(a => a.SerialNumber)
                .ToListAsync();
        }

        public async Task<List<Asset>> GetByFacilityAsync(int facilityId)
        {
            return await _context.Assets
                .Where(a => a.FacilityId == facilityId)
                .OrderBy(a => a.AssetType)
                .ThenBy(a => a.SerialNumber)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(string serialNumber)
        {
            return await _context.Assets
                .AnyAsync(a => a.SerialNumber == serialNumber);
        }

        public async Task AddAsync(Asset asset)
        {
            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset != null)
            {
                _context.Assets.Remove(asset);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Asset>> GetAssetsAsync(string? status, int? facilityId)
        {
            var query = _context.Assets.AsQueryable();

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<AssetStatus>(status, true, out var assetStatus))
            {
                query = query.Where(a => a.Status == assetStatus);
            }

            if (facilityId.HasValue)
            {
                query = query.Where(a => a.FacilityId == facilityId.Value);
            }

            return await query.ToListAsync();
        }

        public async Task UpdatePackingStatusAsync(int assetId, string status)
        {
            var asset = await _context.Assets.FindAsync(assetId);
            if (asset != null)
            {
                // Update packing status logic here
                await _context.SaveChangesAsync();
            }
        }

        public async Task<string> GetPackingStatusAsync(int assetId)
        {
            var asset = await _context.Assets.FindAsync(assetId);
            return asset?.Status.ToString() ?? "Unknown";
        }
    }
}
