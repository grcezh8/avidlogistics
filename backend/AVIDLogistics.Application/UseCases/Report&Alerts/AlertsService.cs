using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
using System.Linq;

public class AlertsService
{
    private readonly IAlertsRepository _alertsRepository;
    private readonly INotificationGateway _notificationGateway;

    public AlertsService(IAlertsRepository alertsRepository, INotificationGateway notificationGateway)
    {
        _alertsRepository = alertsRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<List<MissingSealAlert>> GetMissingSealsAsync()
    {
        var alerts = await _alertsRepository.GetMissingSealsAsync();
        return alerts.Select(MapToMissingSealAlert).ToList();
    }

    public async Task<List<OverdueReturnAlert>> GetOverdueReturnsAsync()
    {
        var alerts = await _alertsRepository.GetOverdueReturnsAsync();
        return alerts.Select(MapToOverdueReturnAlert).ToList();
    }

    public async Task<List<DiscrepancyAlert>> GetUnresolvedDiscrepanciesAsync()
    {
        var alerts = await _alertsRepository.GetUnresolvedDiscrepanciesAsync();
        return alerts.Select(MapToDiscrepancyAlert).ToList();
    }

    public async Task<List<AssetMaintenanceAlert>> GetAssetsNeedingMaintenanceAsync()
    {
        var alerts = await _alertsRepository.GetAssetsNeedingMaintenanceAsync();
        return alerts.Select(MapToAssetMaintenanceAlert).ToList();
    }

    // ================================
    // Private mapping helpers
    // ================================
    private MissingSealAlert MapToMissingSealAlert(Alert a)
    {
        return new MissingSealAlert(
            AssetId: a.Id,
            AssetSerialNumber: "UNKNOWN",
            ElectionId: 0,
            ElectionName: "N/A",
            ExpectedSealNumber: "N/A",
            LastUpdated: a.CreatedAt
        );
    }

    private OverdueReturnAlert MapToOverdueReturnAlert(Alert a)
    {
        return new OverdueReturnAlert(
            AssetId: a.Id,
            AssetSerialNumber: "UNKNOWN",
            ElectionId: 0,
            ElectionName: "N/A",
            ExpectedReturnDate: a.CreatedAt.AddDays(7), // Example placeholder
            DaysOverdue: 0
        );
    }

    private DiscrepancyAlert MapToDiscrepancyAlert(Alert a)
    {
        return new DiscrepancyAlert(
            DiscrepancyId: a.Id,
            AssetId: a.Id,
            AssetSerialNumber: "UNKNOWN",
            ExpectedLocation: "N/A",
            ActualLocation: "N/A",
            CreatedDate: a.CreatedAt,
            DaysUnresolved: 0
        );
    }

    private AssetMaintenanceAlert MapToAssetMaintenanceAlert(Alert a)
    {
        return new AssetMaintenanceAlert(
            AssetId: a.Id,
            AssetSerialNumber: "UNKNOWN",
            AssetType: "N/A",
            Condition: "N/A",
            LastMaintenanceDate: a.CreatedAt,
            DaysSinceLastMaintenance: 0
        );
    }

    // ================================
    // Existing method
    // ================================
    public async Task ProcessAlertsAsync()
    {
        var missingSeals = await GetMissingSealsAsync();
        if (missingSeals.Any())
        {
            await _notificationGateway.NotifyWarehouseAsync($"Alert: {missingSeals.Count} assets with missing seals");
        }

        var overdueReturns = await GetOverdueReturnsAsync();
        if (overdueReturns.Any())
        {
            await _notificationGateway.NotifyWarehouseAsync($"Alert: {overdueReturns.Count} overdue asset returns");
        }

        var unresolvedDiscrepancies = await GetUnresolvedDiscrepanciesAsync();
        if (unresolvedDiscrepancies.Any())
        {
            await _notificationGateway.NotifyWarehouseAsync($"Alert: {unresolvedDiscrepancies.Count} unresolved audit discrepancies");
        }

        var maintenanceNeeded = await GetAssetsNeedingMaintenanceAsync();
        if (maintenanceNeeded.Any())
        {
            await _notificationGateway.NotifyWarehouseAsync($"Alert: {maintenanceNeeded.Count} assets need maintenance");
        }
    }
}
