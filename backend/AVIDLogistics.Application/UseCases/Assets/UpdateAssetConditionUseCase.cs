using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdateAssetConditionUseCase
{
    private readonly IAssetRepository _assetRepository;

    public UpdateAssetConditionUseCase(IAssetRepository assetRepository)
    {
        _assetRepository = assetRepository;
    }

    public async Task ExecuteAsync(int assetId, AssetCondition newCondition)
    {
        var asset = await _assetRepository.GetByIdAsync(assetId);
        if (asset == null)
            throw new AssetNotFoundException($"Asset {assetId} not found");

        asset.UpdateCondition(newCondition);
        await _assetRepository.UpdateAsync(asset);
    }
}

    public class GetAssetByBarcodeUseCase
    {
        private readonly IAssetRepository _assetRepository;

        public GetAssetByBarcodeUseCase(IAssetRepository assetRepository)
        {
            _assetRepository = assetRepository;
        }

        public async Task<Asset> ExecuteAsync(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                throw new ArgumentException("Barcode is required");

            return await _assetRepository.GetByBarcodeAsync(barcode);
        }
    }
