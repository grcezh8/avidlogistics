using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IAlertsRepository
    {
        Task<Alert?> GetByIdAsync(int id);
        Task<List<Alert>> GetAllAsync();
        Task<List<Alert>> GetActiveAlertsAsync();
        Task<List<Alert>> GetAlertsByTypeAsync(AlertType alertType);
        Task<List<Alert>> GetAlertsBySeverityAsync(AlertSeverity severity);
        Task AddAsync(Alert alert);
        Task UpdateAsync(Alert alert);
        Task DeleteAsync(int id);
        Task ResolveAlertAsync(int id, string resolvedBy);
        Task DismissAlertAsync(int id);
        
        // Legacy methods for backward compatibility
        Task<List<Alert>> GetMissingSealsAsync();
        Task<List<Alert>> GetOverdueReturnsAsync();
        Task<List<Alert>> GetUnresolvedDiscrepanciesAsync();
        Task<List<Alert>> GetAssetsNeedingMaintenanceAsync();
        
        // New alert creation methods
        Task CreateDeliveryDelayAlertAsync(int manifestId, string pollSiteName, int delayMinutes);
        Task CreatePickupDelayAlertAsync(int pollSiteId, string pollSiteName, int delayMinutes);
        Task CreateMissingAssetAlertAsync(int assetId, string serialNumber, int hoursNotScanned);
    }
}
