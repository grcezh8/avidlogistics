using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdateAssetStatusUseCase
{
    private readonly IAssetRepository _assetRepository;
    private readonly INotificationGateway _notificationGateway;

    public UpdateAssetStatusUseCase(IAssetRepository assetRepository, INotificationGateway notificationGateway)
    {
        _assetRepository = assetRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int assetId, AssetStatus newStatus, string location = null)
    {
        var asset = await _assetRepository.GetByIdAsync(assetId);
        if (asset == null)
            throw new AssetNotFoundException($"Asset {assetId} not found");

        var oldStatus = asset.Status;

        // Use reflection to directly set the status since the domain methods don't cover all transitions
        var statusProperty = typeof(Asset).GetProperty("Status");
        if (statusProperty != null)
        {
            statusProperty.SetValue(asset, newStatus);

            // Update location if provided
            if (!string.IsNullOrEmpty(location))
            {
                var locationProperty = typeof(Asset).GetProperty("Location");
                locationProperty?.SetValue(asset, location);
            }
        }

        await _assetRepository.UpdateAsync(asset);

        await _notificationGateway.NotifyWarehouseAsync(
            $"Asset {asset.SerialNumber} status changed from {oldStatus} to {newStatus}");
    }
}