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
            return await _context.Alerts.FindAsync(id);
        }

        public async Task<List<Alert>> GetAllAsync()
        {
            return await _context.Alerts
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetActiveAlertsAsync()
        {
            return await _context.Alerts
                .Where(a => a.Status == AlertStatus.Active)
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetAlertsByTypeAsync(AlertType alertType)
        {
            return await _context.Alerts
                .Where(a => a.AlertType == alertType && a.Status == AlertStatus.Active)
                .OrderByDescending(a => a.Priority)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetAlertsBySeverityAsync(AlertSeverity severity)
        {
            return await _context.Alerts
                .Where(a => a.Severity == severity && a.Status == AlertStatus.Active)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Alert alert)
        {
            alert.CreatedAt = DateTime.UtcNow;
            alert.UpdatedAt = DateTime.UtcNow;
            _context.Alerts.Add(alert);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Alert alert)
        {
            alert.UpdatedAt = DateTime.UtcNow;
            _context.Alerts.Update(alert);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert != null)
            {
                _context.Alerts.Remove(alert);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ResolveAlertAsync(int id, string resolvedBy)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert != null)
            {
                alert.Status = AlertStatus.Resolved;
                alert.ResolvedAt = DateTime.UtcNow;
                alert.ResolvedBy = resolvedBy;
                alert.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DismissAlertAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert != null)
            {
                alert.Status = AlertStatus.Dismissed;
                alert.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Legacy methods for backward compatibility - now generate and persist alerts
        public async Task<List<Alert>> GetMissingSealsAsync()
        {
            // Check for existing missing seal alerts first
            var existingAlerts = await _context.Alerts
                .Where(a => a.AlertType == AlertType.MissingSeal && a.Status == AlertStatus.Active)
                .ToListAsync();

            // Generate new alerts for missing seals not already alerted
            var missingSealsQuery = from mi in _context.ManifestItems
                                   join a in _context.Assets on mi.AssetId equals a.Id
                                   where a.Status == AssetStatus.Pending &&
                                         (mi.SealNumber == null || mi.SealNumber == "") &&
                                         !existingAlerts.Any(ea => ea.RelatedEntityId == a.Id && ea.RelatedEntityType == "Asset")
                                   select new Alert
                                   {
                                       Title = "Missing Seal Alert",
                                       Message = $"Asset {a.SerialNumber} is missing seal",
                                       AlertType = AlertType.MissingSeal,
                                       Severity = AlertSeverity.Medium,
                                       Status = AlertStatus.Active,
                                       RelatedEntityId = a.Id,
                                       RelatedEntityType = "Asset",
                                       Priority = 2
                                   };

            var newAlerts = await missingSealsQuery.ToListAsync();
            if (newAlerts.Any())
            {
                _context.Alerts.AddRange(newAlerts);
                await _context.SaveChangesAsync();
            }

            return existingAlerts.Concat(newAlerts).ToList();
        }

        public async Task<List<Alert>> GetOverdueReturnsAsync()
        {
            var existingAlerts = await _context.Alerts
                .Where(a => a.AlertType == AlertType.OverdueReturn && a.Status == AlertStatus.Active)
                .ToListAsync();

            var overdueReturnsQuery = from a in _context.Assets
                                     where a.Status == AssetStatus.Unavailable &&
                                           !existingAlerts.Any(ea => ea.RelatedEntityId == a.Id && ea.RelatedEntityType == "Asset")
                                     select new Alert
                                     {
                                         Title = "Overdue Return Alert",
                                         Message = $"Asset {a.SerialNumber} is overdue for return",
                                         AlertType = AlertType.OverdueReturn,
                                         Severity = AlertSeverity.High,
                                         Status = AlertStatus.Active,
                                         RelatedEntityId = a.Id,
                                         RelatedEntityType = "Asset",
                                         Priority = 3
                                     };

            var newAlerts = await overdueReturnsQuery.ToListAsync();
            if (newAlerts.Any())
            {
                _context.Alerts.AddRange(newAlerts);
                await _context.SaveChangesAsync();
            }

            return existingAlerts.Concat(newAlerts).ToList();
        }

        public async Task<List<Alert>> GetUnresolvedDiscrepanciesAsync()
        {
            return await _context.Alerts
                .Where(a => a.AlertType == AlertType.InventoryDiscrepancy && a.Status == AlertStatus.Active)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetAssetsNeedingMaintenanceAsync()
        {
            var existingAlerts = await _context.Alerts
                .Where(a => a.AlertType == AlertType.EquipmentMaintenance && a.Status == AlertStatus.Active)
                .ToListAsync();

            var maintenanceAlertsQuery = from a in _context.Assets
                                        where a.Condition == AssetCondition.NeedsRepair &&
                                              !existingAlerts.Any(ea => ea.RelatedEntityId == a.Id && ea.RelatedEntityType == "Asset")
                                        select new Alert
                                        {
                                            Title = "Equipment Maintenance Required",
                                            Message = $"Asset {a.SerialNumber} needs maintenance",
                                            AlertType = AlertType.EquipmentMaintenance,
                                            Severity = AlertSeverity.Medium,
                                            Status = AlertStatus.Active,
                                            RelatedEntityId = a.Id,
                                            RelatedEntityType = "Asset",
                                            Priority = 2
                                        };

            var newAlerts = await maintenanceAlertsQuery.ToListAsync();
            if (newAlerts.Any())
            {
                _context.Alerts.AddRange(newAlerts);
                await _context.SaveChangesAsync();
            }

            return existingAlerts.Concat(newAlerts).ToList();
        }

        public async Task CreateDeliveryDelayAlertAsync(int manifestId, string pollSiteName, int delayMinutes)
        {
            var alert = new Alert
            {
                Title = $"Delivery Delay - Manifest #{manifestId}",
                Message = $"Manifest delivery is {delayMinutes} minutes overdue for {pollSiteName}",
                AlertType = AlertType.DeliveryDelay,
                Severity = delayMinutes > 60 ? AlertSeverity.Critical : AlertSeverity.High,
                Status = AlertStatus.Active,
                RelatedEntityId = manifestId,
                RelatedEntityType = "Manifest",
                Priority = delayMinutes > 60 ? 4 : 3
            };

            await AddAsync(alert);
        }

        public async Task CreatePickupDelayAlertAsync(int pollSiteId, string pollSiteName, int delayMinutes)
        {
            var alert = new Alert
            {
                Title = "Pickup Delay",
                Message = $"Equipment pickup from {pollSiteName} is {delayMinutes} minutes overdue",
                AlertType = AlertType.PickupDelay,
                Severity = delayMinutes > 60 ? AlertSeverity.High : AlertSeverity.Medium,
                Status = AlertStatus.Active,
                RelatedEntityId = pollSiteId,
                RelatedEntityType = "PollSite",
                Priority = delayMinutes > 60 ? 3 : 2
            };

            await AddAsync(alert);
        }

        public async Task CreateMissingAssetAlertAsync(int assetId, string serialNumber, int hoursNotScanned)
        {
            var alert = new Alert
            {
                Title = "Missing Asset Alert",
                Message = $"Asset {serialNumber} has not been scanned in over {hoursNotScanned} hours",
                AlertType = AlertType.MissingAsset,
                Severity = hoursNotScanned > 48 ? AlertSeverity.Critical : AlertSeverity.High,
                Status = AlertStatus.Active,
                RelatedEntityId = assetId,
                RelatedEntityType = "Asset",
                Priority = hoursNotScanned > 48 ? 4 : 3
            };

            await AddAsync(alert);
        }
    }
}
