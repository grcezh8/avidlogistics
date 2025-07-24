using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ManifestItemRepository : IManifestItemRepository
    {
        private readonly WarehouseDbContext _context;

        public ManifestItemRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<ManifestItem?> GetByIdAsync(int id)
        {
            return await _context.ManifestItems.FindAsync(id);
        }

        public async Task<IEnumerable<ManifestItem>> GetAllByManifestIdAsync(int manifestId)
        {
            return await _context.ManifestItems
                .Where(mi => mi.ManifestId == manifestId)
                .ToListAsync();
        }

        public async Task AddAsync(ManifestItem item)
        {
            _context.ManifestItems.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ManifestItem item)
        {
            _context.ManifestItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _context.ManifestItems.FindAsync(id);
            if (item != null)
            {
                _context.ManifestItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
}
