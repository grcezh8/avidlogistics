using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class RegisterAssetUseCase
{
    private readonly IAssetRepository _assetRepository;
    private readonly IBarcodeGenerator _barcodeGenerator;
    private readonly INotificationGateway _notificationGateway;

    public RegisterAssetUseCase(
        IAssetRepository assetRepository,
        IBarcodeGenerator barcodeGenerator,
        INotificationGateway notificationGateway)
    {
        _assetRepository = assetRepository;
        _barcodeGenerator = barcodeGenerator;
        _notificationGateway = notificationGateway;
    }

    public async Task<RegisterAssetOutput> ExecuteAsync(RegisterAssetInput input)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(input.SerialNumber))
            return new RegisterAssetOutput(0, null, false, "Serial number is required");

        if (string.IsNullOrWhiteSpace(input.AssetType))
            return new RegisterAssetOutput(0, null, false, "Asset type is required");

        // Check for duplicates
        if (await _assetRepository.ExistsAsync(input.SerialNumber))
            return new RegisterAssetOutput(0, null, false, "Asset with this serial number already exists");

        try
        {
            // Create domain entity
            var asset = new Asset(input.SerialNumber, input.AssetType);

            // Generate barcode if not provided
            var barcode = _barcodeGenerator.GenerateBarcode();


            // Register the asset
            asset.Register(barcode, input.RfidTag);

            // Save to repository
            await _assetRepository.AddAsync(asset);

            // Notify warehouse
            await _notificationGateway.NotifyWarehouseAsync(
                $"New asset registered: {input.AssetType} - {input.SerialNumber}");

            return new RegisterAssetOutput(asset.Id, barcode, true, "Asset registered successfully");
        }
        catch (Exception ex)
        {
            return new RegisterAssetOutput(0, null, false, $"Error: {ex.Message}");
        }
    }
}
