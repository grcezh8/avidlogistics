using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class ChainOfCustodyService
{
    private readonly IChainOfCustodyRepository _chainOfCustodyRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly INotificationGateway _notificationGateway;

    public ChainOfCustodyService(
        IChainOfCustodyRepository chainOfCustodyRepository,
        IActivityRepository activityRepository,
        INotificationGateway notificationGateway)
    {
        _chainOfCustodyRepository = chainOfCustodyRepository;
        _activityRepository = activityRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> CreateChainOfCustodyEventAsync(CreateChainOfCustodyEventInput input, int createdBy)
    {
        var custodyEvent = new ChainOfCustodyEvent(
            input.ElectionId, input.AssetId, input.FromParty,
            input.ToParty, input.SealNumber, createdBy, input.Notes);

        var eventId = await _chainOfCustodyRepository.SaveAsync(custodyEvent);

        // Log activity
        var activity = new Activity(
            "ChainOfCustody",
            $"Asset transferred from {input.FromParty} to {input.ToParty}",
            createdBy, input.ElectionId, input.AssetId);
        await _activityRepository.SaveAsync(activity);

        await _notificationGateway.NotifyWarehouseAsync($"Chain of custody event recorded for asset {input.AssetId}");
        return eventId;
    }

    public async Task<List<ChainOfCustodyEvent>> GetChainOfCustodyByAssetAsync(int assetId)
    {
        return await _chainOfCustodyRepository.GetByAssetIdAsync(assetId);
    }

    public async Task<List<ChainOfCustodyEvent>> GetChainOfCustodyByElectionAsync(int electionId)
    {
        return await _chainOfCustodyRepository.GetByElectionIdAsync(electionId);
    }
}