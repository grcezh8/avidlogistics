using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class PollSiteRepository : IPollSiteRepository
    {
        private readonly WarehouseDbContext _context;

        public PollSiteRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<PollSite?> GetByIdAsync(int id)
        {
            return await _context.PollSites.FirstOrDefaultAsync(p => p.PollSiteId == id);
        }

        public async Task<List<PollSite>> GetAllAsync()
        {
            return await _context.PollSites.Where(p => p.IsActive).ToListAsync();
        }

        public async Task AddAsync(PollSite pollSite)
        {
            await _context.PollSites.AddAsync(pollSite);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PollSite pollSite)
        {
            _context.PollSites.Update(pollSite);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var pollSite = await GetByIdAsync(id);
            if (pollSite != null)
            {
                _context.PollSites.Remove(pollSite);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string siteNumber)
        {
            return await _context.PollSites.AnyAsync(p => p.SiteNumber == siteNumber);
        }

        public async Task<int> SaveAsync(PollSite pollSite)
        {
            if (pollSite.PollSiteId == 0)
            {
                await _context.PollSites.AddAsync(pollSite);
            }
            else
            {
                _context.PollSites.Update(pollSite);
            }
            await _context.SaveChangesAsync();
            return pollSite.PollSiteId;
        }
    }
}
