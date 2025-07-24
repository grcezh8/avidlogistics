using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.UseCases.Kits
{
    public class CreateKitUseCase
{
    private readonly IKitRepository _kitRepository;
    private readonly IAssetRepository _assetRepository;

    public CreateKitUseCase(IKitRepository kitRepository, IAssetRepository assetRepository)
    {
        _kitRepository = kitRepository;
        _assetRepository = assetRepository;
    }

    public async Task<int> ExecuteAsync(CreateKitInput input)
    {
        // Parse kit type
        if (!Enum.TryParse<KitType>(input.KitType, out var kitType))
            throw new ArgumentException("Invalid kit type");

        // Create kit
        var kit = new Kit(input.Name, kitType);

        // Add assets to kit
        foreach (var assetId in input.AssetIds)
        {
            var asset = await _assetRepository.GetByIdAsync(assetId);
            if (asset == null)
                throw new AssetNotFoundException($"Asset {assetId} not found");

            if (asset.Status != AssetStatus.Available)
                throw new InvalidAssetStateException($"Asset {assetId} is not available");

            kit.AddAsset(assetId);
            asset.AssignToKit(kit.Id);
            await _assetRepository.UpdateAsync(asset);
        }

        // Save kit
        await _kitRepository.AddAsync(kit);
        return 1; // TODO: Return actual ID from repository
    }
}
}
