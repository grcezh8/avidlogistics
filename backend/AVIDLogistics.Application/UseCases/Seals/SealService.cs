using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class SealService
{
    private readonly ISealRepository _sealRepository;
    private readonly INotificationGateway _notificationGateway;

    public SealService(ISealRepository sealRepository, INotificationGateway notificationGateway)
    {
        _sealRepository = sealRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> CreateSealAsync(CreateSealInput input, int createdBy)
    {
        if (await _sealRepository.ExistsAsync(input.SealNumber))
            throw new InvalidOperationException("Seal with this number already exists");

        var seal = new Seal(input.SealNumber, createdBy);
        await _sealRepository.SaveAsync(seal);
        return seal.SealId;

    }

    public async Task ApplySealAsync(ApplySealInput input)
    {
        var seal = await _sealRepository.GetBySealNumberAsync(input.SealNumber);
        if (seal == null)
            throw new SealNotFoundException($"Seal {input.SealNumber} not found");

        seal.Apply(input.ElectionId, input.AssetId, input.AppliedBy);
        await _sealRepository.UpdateAsync(seal);

        await _notificationGateway.NotifyWarehouseAsync($"Seal {input.SealNumber} applied to asset {input.AssetId}");
    }

    public async Task<List<Seal>> GetAvailableSealsAsync()
    {
        return await _sealRepository.GetByStatusAsync(SealStatus.Available);
    }

    public async Task<List<Seal>> GetSealsByElectionAsync(int electionId)
    {
        return await _sealRepository.GetByElectionIdAsync(electionId);
    }
}