using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class AlertsRepository : IAlertsRepository
    {
        private readonly WarehouseDbContext _context;

        public AlertsRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Alert?> GetByIdAsync(int id)
        {
            return await _context.Set<Alert>().FindAsync(id);
        }

        public async Task<List<Alert>> GetAllAsync()
        {
            return await _context.Set<Alert>().ToListAsync();
        }

        public async Task AddAsync(Alert alert)
        {
            _context.Set<Alert>().Add(alert);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Alert alert)
        {
            _context.Set<Alert>().Update(alert);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var alert = await _context.Set<Alert>().FindAsync(id);
            if (alert != null)
            {
                _context.Set<Alert>().Remove(alert);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Alert>> GetMissingSealsAsync()
        {
            // Create alerts for missing seals
            var missingSeals = from mi in _context.ManifestItems
                              join a in _context.Assets on mi.AssetId equals a.Id
                              where a.Status == AssetStatus.Pending &&
                                    (mi.SealNumber == null || mi.SealNumber == "")
                              select new Alert
                              {
                                  Message = $"Asset {a.SerialNumber} is missing seal",
                                  CreatedAt = DateTime.UtcNow,
                                  IsResolved = false
                              };

            return await missingSeals.ToListAsync();
        }

        public async Task<List<Alert>> GetOverdueReturnsAsync()
        {
            var overdueReturns = from a in _context.Assets
                                where a.Status == AssetStatus.Unavailable
                                select new Alert
                                {
                                    Message = $"Asset {a.SerialNumber} is overdue for return",
                                    CreatedAt = DateTime.UtcNow,
                                    IsResolved = false
                                };

            return await overdueReturns.ToListAsync();
        }

        public async Task<List<Alert>> GetUnresolvedDiscrepanciesAsync()
        {
            // Return empty list since DiscrepancyRecords table doesn't exist yet
            return new List<Alert>();
        }

        public async Task<List<Alert>> GetAssetsNeedingMaintenanceAsync()
        {
            var maintenanceAlerts = from a in _context.Assets
                                   where a.Condition == AssetCondition.NeedsRepair
                                   select new Alert
                                   {
                                       Message = $"Asset {a.SerialNumber} needs maintenance",
                                       CreatedAt = DateTime.UtcNow,
                                       IsResolved = false
                                   };

            return await maintenanceAlerts.ToListAsync();
        }
    }
}
