using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CreateBDELRequestUseCase
{
    private readonly IBDELRequestRepository _bdelRequestRepository;
    private readonly IPollSiteRepository _pollSiteRepository;
    private readonly INotificationGateway _notificationGateway;

    public CreateBDELRequestUseCase(
        IBDELRequestRepository bdelRequestRepository,
        IPollSiteRepository pollSiteRepository,
        INotificationGateway notificationGateway)
    {
        _bdelRequestRepository = bdelRequestRepository;
        _pollSiteRepository = pollSiteRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> ExecuteAsync(CreateBDELRequestInput input, int requestedBy)
    {
        // Validate facilities exist
        if (input.FromFacilityId.HasValue)
        {
            var fromFacility = await _pollSiteRepository.GetByIdAsync(input.FromFacilityId.Value);
            if (fromFacility == null)
                throw new PollSiteNotFoundException($"From facility {input.FromFacilityId} not found");
        }

        if (input.ToFacilityId.HasValue)
        {
            var toFacility = await _pollSiteRepository.GetByIdAsync(input.ToFacilityId.Value);
            if (toFacility == null)
                throw new PollSiteNotFoundException($"To facility {input.ToFacilityId} not found");
        }

        // Create BDEL request
        var request = new BDELRequest(input.EventId, input.MapId, input.FromFacilityId,
            input.ToFacilityId, input.BDELReasonId, requestedBy, input.Notes);

        // Add items
        foreach (var item in input.Items)
        {
            request.AddItem(item.EDID, item.ItemDescription, item.Quantity);
        }

        // Save request
        var requestId = await _bdelRequestRepository.SaveAsync(request);

        // Notify administrators
        await _notificationGateway.NotifyLogisticsAsync(
            $"New BDEL request created: {request.RequestNumber}");

        return requestId;
    }
}