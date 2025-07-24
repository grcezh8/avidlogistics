using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class AddAssetToKitUseCase
{
    private readonly IKitRepository _kitRepository;
    private readonly IAssetRepository _assetRepository;

    public AddAssetToKitUseCase(IKitRepository kitRepository, IAssetRepository assetRepository)
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

        if (asset.Status != AssetStatus.Available)
            throw new InvalidAssetStateException($"Asset {assetId} is not available");

        kit.AddAsset(assetId);
        asset.AssignToKit(kitId);

        await _kitRepository.UpdateAsync(kit);
        await _assetRepository.UpdateAsync(asset);
    }
}