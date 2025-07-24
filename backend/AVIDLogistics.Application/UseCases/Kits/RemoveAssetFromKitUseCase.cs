using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class RemoveAssetFromKitUseCase
{
    private readonly IKitRepository _kitRepository;
    private readonly IAssetRepository _assetRepository;

    public RemoveAssetFromKitUseCase(IKitRepository kitRepository, IAssetRepository assetRepository)
    {
        _kitRepository = kitRepository;
        _assetRepository = assetRepository;
    }

    public async Task ExecuteAsync(int kitId, int assetId)
    {
        var kit = await _kitRepository.GetByIdAsync(kitId);
        if (kit == null)
            throw new KitNotFoundException($"Kit {kitId} not found");

        var asset = await _assetRepository.GetByIdAsync(assetId);
        if (asset == null)
            throw new AssetNotFoundException($"Asset {assetId} not found");

        kit.RemoveAsset(assetId);
        asset.ReturnToWarehouse();

        await _kitRepository.UpdateAsync(kit);
        await _assetRepository.UpdateAsync(asset);
    }
}