using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class MarkPollSiteReadyUseCase
{
    private readonly IPollSiteRepository _pollSiteRepository;
    private readonly INotificationGateway _notificationGateway;

    public MarkPollSiteReadyUseCase(IPollSiteRepository pollSiteRepository, INotificationGateway notificationGateway)
    {
        _pollSiteRepository = pollSiteRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int pollSiteId, int modifiedBy)
    {
        var pollSite = await _pollSiteRepository.GetByIdAsync(pollSiteId);
        if (pollSite == null)
            throw new PollSiteNotFoundException($"Poll site {pollSiteId} not found");

        pollSite.MarkReady(modifiedBy);
        await _pollSiteRepository.UpdateAsync(pollSite);

        await _notificationGateway.NotifyLogisticsAsync(
            $"Poll site {pollSite.FacilityName} marked as ready");
    }
}
