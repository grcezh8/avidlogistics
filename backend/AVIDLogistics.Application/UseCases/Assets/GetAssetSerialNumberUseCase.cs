using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

public class GetAssetBySerialNumberUseCase
{
    private readonly IAssetRepository _assetRepository;

    public GetAssetBySerialNumberUseCase(IAssetRepository assetRepository)
    {
        _assetRepository = assetRepository;
    }

    public async Task<Asset> ExecuteAsync(string serialNumber)
    {
        if (string.IsNullOrWhiteSpace(serialNumber))
            throw new ArgumentException("Serial number is required");

        return await _assetRepository.GetBySerialNumberAsync(serialNumber);
    }
}