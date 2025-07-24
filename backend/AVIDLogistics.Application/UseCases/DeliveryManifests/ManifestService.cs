using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class ManifestService
{
    private readonly IManifestRepository _manifestRepository;
    private readonly IManifestItemRepository _manifestItemRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly INotificationGateway _notificationGateway;

    public ManifestService(
        IManifestRepository manifestRepository,
        IManifestItemRepository manifestItemRepository,
        IAssetRepository assetRepository,
        INotificationGateway notificationGateway)
    {
        _manifestRepository = manifestRepository;
        _manifestItemRepository = manifestItemRepository;
        _assetRepository = assetRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> CreateManifestAsync(CreateManifestInput input, int createdBy)
    {
        var manifest = new Manifest(input.ElectionId, input.FromFacilityId, input.ToPollSiteId, createdBy);
        var manifestId = await _manifestRepository.SaveAsync(manifest);

        await _notificationGateway.NotifyWarehouseAsync($"New manifest created: {manifest.ManifestNumber}");
        return manifestId;
    }

    public async Task AddItemToManifestAsync(AddManifestItemInput input)
    {
        var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {input.ManifestId} not found");

        var asset = await _assetRepository.GetByIdAsync(input.AssetId);
        if (asset == null)
            throw new AssetNotFoundException($"Asset {input.AssetId} not found");

        manifest.AddItem(input.AssetId, input.SealNumber);
        await _manifestRepository.UpdateAsync(manifest);
    }

    public async Task RemoveItemFromManifestAsync(int manifestId, int assetId)
    {
        var manifest = await _manifestRepository.GetByIdAsync(manifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {manifestId} not found");

        manifest.RemoveItem(assetId);
        await _manifestRepository.UpdateAsync(manifest);
    }

    public async Task MarkItemPackedAsync(MarkItemPackedInput input)
    {
        var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {input.ManifestId} not found");

        manifest.MarkItemPacked(input.AssetId, input.PackedBy);
        await _manifestRepository.UpdateAsync(manifest);

        if (manifest.Status == ManifestStatus.FullyPacked)
        {
            await _notificationGateway.NotifyWarehouseAsync($"Manifest {manifest.ManifestNumber} fully packed");
        }
    }

    public async Task ReadyManifestForPackingAsync(int manifestId)
    {
        var manifest = await _manifestRepository.GetByIdAsync(manifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {manifestId} not found");

        manifest.ReadyForPacking();
        await _manifestRepository.UpdateAsync(manifest);
    }

    public async Task CompleteManifestAsync(int manifestId)
    {
        var manifest = await _manifestRepository.GetByIdAsync(manifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {manifestId} not found");

        manifest.Complete();
        await _manifestRepository.UpdateAsync(manifest);

        await _notificationGateway.NotifyWarehouseAsync($"Manifest {manifest.ManifestNumber} completed");
    }

    public async Task<List<Manifest>> GetManifestsByElectionAsync(int electionId)
    {
        return await _manifestRepository.GetByElectionIdAsync(electionId);
    }

    public async Task<List<Manifest>> GetManifestsByFacilityAsync(int facilityId)
    {
        return await _manifestRepository.GetByFacilityIdAsync(facilityId);
    }

    public async Task<Manifest> GetManifestByIdAsync(int manifestId)
    {
        return await _manifestRepository.GetByIdAsync(manifestId);
    }
}