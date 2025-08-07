using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class CoCFormStatusRepository : ICoCFormStatusRepository
    {
        private readonly WarehouseDbContext _context;

        public CoCFormStatusRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveAsync(CoCFormStatus formStatus)
        {
            _context.CoCFormStatuses.Add(formStatus);
            await _context.SaveChangesAsync();
            return formStatus.CoCFormStatusId;
        }

        public async Task<CoCFormStatus?> GetByIdAsync(int formStatusId)
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .FirstOrDefaultAsync(f => f.CoCFormStatusId == formStatusId);
        }

        public async Task<CoCFormStatus?> GetByManifestIdAsync(int manifestId)
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .FirstOrDefaultAsync(f => f.ManifestId == manifestId);
        }

        public async Task<CoCFormStatus?> GetByFormUrlAsync(string formUrl)
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .FirstOrDefaultAsync(f => f.FormUrl == formUrl);
        }

        public async Task<bool> UpdateAsync(CoCFormStatus formStatus)
        {
            _context.CoCFormStatuses.Update(formStatus);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int formStatusId)
        {
            var formStatus = await _context.CoCFormStatuses.FindAsync(formStatusId);
            if (formStatus == null)
                return false;

            _context.CoCFormStatuses.Remove(formStatus);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IEnumerable<CoCFormStatus>> GetByStatusAsync(string status)
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .Where(f => f.Status == status)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CoCFormStatus>> GetExpiredFormsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .Where(f => f.ExpiresAt.HasValue && f.ExpiresAt.Value < now && f.Status != "Completed")
                .OrderBy(f => f.ExpiresAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CoCFormStatus>> GetUnresolvedFormsAsync()
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .Where(f => f.Status != "Completed" && f.Status != "Expired")
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CoCFormStatus>> GetAllAsync()
        {
            return await _context.CoCFormStatuses
                .Include(f => f.Manifest)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
    }
}
