using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class KitRepository : IKitRepository
    {
        private readonly WarehouseDbContext _context;

        public KitRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Kit?> GetByIdAsync(int id)
        {
            return await _context.Kits.FindAsync(id);
        }

        public async Task<Kit?> GetByIdWithAssetsAsync(int id)
        {
            return await _context.Kits
                .Include(k => k.AssetKits)
                    .ThenInclude(ak => ak.Asset)
                .FirstOrDefaultAsync(k => k.Id == id);
        }

        public async Task<List<Kit>> GetByPollSiteIdAsync(int pollSiteId)
        {
            return await _context.Kits
                .Where(k => k.PollSiteId == pollSiteId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Kit>> GetByStatusAsync(KitStatus status)
        {
            return await _context.Kits
                .Where(k => k.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<Kit>> GetByStatusWithAssetsAsync(KitStatus status)
        {
            return await _context.Kits
                .Include(k => k.AssetKits)
                    .ThenInclude(ak => ak.Asset)
                .Where(k => k.Status == status)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Kit kit)
        {
            _context.Kits.Add(kit);
            await _context.SaveChangesAsync();
            return kit.Id;
        }

        public async Task UpdateAsync(Kit kit)
        {
            _context.Kits.Update(kit);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Kit>> GetAllAsync()
        {
            return await _context.Kits.ToListAsync();
        }

        public async Task AddAsync(Kit kit)
        {
            _context.Kits.Add(kit);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var kit = await _context.Kits.FindAsync(id);
            if (kit != null)
            {
                _context.Kits.Remove(kit);
                await _context.SaveChangesAsync();
            }
        }
    }
}
