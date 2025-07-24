using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;
using AVIDLogistics.Domain.Enums;


namespace AVIDLogistics.Infrastructure.Repositories
{
    public class DeliveryManifestRepository : IDeliveryManifestRepository
    {
        private readonly WarehouseDbContext _context;

        public DeliveryManifestRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<DeliveryManifest> GetByIdAsync(int id)
        {
            return await _context.DeliveryManifests.FindAsync(id);
        }

        public async Task<DeliveryManifest> GetByManifestNumberAsync(string manifestNumber)
        {
            return await _context.DeliveryManifests
                .FirstOrDefaultAsync(dm => dm.ManifestNumber == manifestNumber);
        }

        public async Task<List<DeliveryManifest>> GetByPollSiteIdAsync(int pollSiteId)
        {
            return await _context.DeliveryManifests
                .Where(dm => dm.PollSiteId == pollSiteId)
                .ToListAsync();
        }

        public async Task<List<DeliveryManifest>> GetByStatusAsync(DeliveryStatus status)
        {
            return await _context.DeliveryManifests
                .Where(dm => dm.Status == status)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(DeliveryManifest manifest)
        {
            _context.DeliveryManifests.Add(manifest);
            await _context.SaveChangesAsync();
            return manifest.Id;
        }

        public async Task UpdateAsync(DeliveryManifest manifest)
        {
            _context.DeliveryManifests.Update(manifest);
            await _context.SaveChangesAsync();
        }
    
        public async Task<List<DeliveryManifest>> GetAllAsync()
        {
            return await _context.DeliveryManifests.ToListAsync();
        }

        public async Task AddAsync(DeliveryManifest manifest)
        {
            _context.DeliveryManifests.Add(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var manifest = await _context.DeliveryManifests.FindAsync(id);
            if (manifest != null)
            {
                _context.DeliveryManifests.Remove(manifest);
                await _context.SaveChangesAsync();
            }
        }

    }
}
