using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class PackingService
{
    private readonly IManifestRepository _manifestRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly INotificationGateway _notificationGateway;

    public PackingService(
        IManifestRepository manifestRepository,
        IAssetRepository assetRepository,
        INotificationGateway notificationGateway)
    {
        _manifestRepository = manifestRepository;
        _assetRepository = assetRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<List<Manifest>> GetManifestsReadyForPackingAsync()
    {
        return await _manifestRepository.GetByStatusAsync(ManifestStatus.ReadyForPacking);
    }

    public async Task<List<Manifest>> GetPartiallyPackedManifestsAsync()
    {
        return await _manifestRepository.GetByStatusAsync(ManifestStatus.PartiallyPacked);
    }

    public async Task ValidatePackingAsync(int manifestId)
    {
        var manifest = await _manifestRepository.GetByIdAsync(manifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {manifestId} not found");

        foreach (var item in manifest.Items)
        {
            var asset = await _assetRepository.GetByIdAsync(item.AssetId);
            if (asset == null)
                throw new AssetNotFoundException($"Asset {item.AssetId} not found");

            if (asset.Status != AssetStatus.Available && asset.Status != AssetStatus.Assigned)
                throw new InvalidAssetStateException($"Asset {item.AssetId} is not available for packing");
        }
    }
}