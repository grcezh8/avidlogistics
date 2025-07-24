using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CancelPollSiteUseCase
{
    private readonly IPollSiteRepository _pollSiteRepository;
    private readonly INotificationGateway _notificationGateway;

    public CancelPollSiteUseCase(IPollSiteRepository pollSiteRepository, INotificationGateway notificationGateway)
    {
        _pollSiteRepository = pollSiteRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int pollSiteId, string reason, int modifiedBy)
    {
        var pollSite = await _pollSiteRepository.GetByIdAsync(pollSiteId);
        if (pollSite == null)
            throw new PollSiteNotFoundException($"Poll site {pollSiteId} not found");

        pollSite.Cancel(reason, modifiedBy);
        await _pollSiteRepository.UpdateAsync(pollSite);

        await _notificationGateway.NotifyLogisticsAsync(
            $"Poll site {pollSite.FacilityName} cancelled: {reason}");
    }
}