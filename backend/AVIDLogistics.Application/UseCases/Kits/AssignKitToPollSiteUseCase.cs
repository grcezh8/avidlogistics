using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class AssignKitToPollSiteUseCase
{
    private readonly IKitRepository _kitRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly IAVIDService _avidService;
    private readonly INotificationGateway _notificationGateway;

    public AssignKitToPollSiteUseCase(
        IKitRepository kitRepository,
        IAssetRepository assetRepository,
        IAVIDService avidService,
        INotificationGateway notificationGateway)
    {
        _kitRepository = kitRepository;
        _assetRepository = assetRepository;
        _avidService = avidService;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(AssignKitToPollSiteInput input)
    {
        // Get kit
        var kit = await _kitRepository.GetByIdAsync(input.KitId);
        if (kit == null)
            throw new KitNotFoundException($"Kit {input.KitId} not found");

        // Validate poll site with AVID
        if (!await _avidService.ValidatePollSiteAsync(input.PollSiteId))
            throw new InvalidPollSiteException($"Poll site {input.PollSiteId} not found in AVID");

        // Get poll site info
        var pollSiteInfo = await _avidService.GetPollSiteInfoAsync(input.PollSiteId);

        // Get all assets in kit
        var assets = new List<Asset>();
        foreach (var assetId in kit.GetAssetIds())
        {
            var asset = await _assetRepository.GetByIdAsync(assetId);
            if (asset != null)
            {
                assets.Add(asset);
            }
        }

        // Assign kit to poll site
        kit.AssignToPollSite(input.PollSiteId);
        await _kitRepository.UpdateAsync(kit);

        // Notify logistics
        await _notificationGateway.NotifyLogisticsAsync(
            $"Kit {kit.Name} assigned to {pollSiteInfo.Name}");

        // Update AVID
        await _avidService.NotifyElectionStatusAsync(input.PollSiteId, "Kit Assigned");
    }
}
