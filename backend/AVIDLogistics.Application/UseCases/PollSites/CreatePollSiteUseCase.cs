using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CreatePollSiteUseCase
{
    private readonly IPollSiteRepository _pollSiteRepository;
    private readonly INotificationGateway _notificationGateway;

    public CreatePollSiteUseCase(
        IPollSiteRepository pollSiteRepository,
        INotificationGateway notificationGateway)
    {
        _pollSiteRepository = pollSiteRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> ExecuteAsync(CreatePollSiteInput input, int createdBy)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(input.SiteNumber))
            throw new ArgumentException("Site number is required");

        if (string.IsNullOrWhiteSpace(input.FacilityName))
            throw new ArgumentException("Facility name is required");

        // Check for duplicates
        if (await _pollSiteRepository.ExistsAsync(input.SiteNumber))
            throw new InvalidOperationException("Poll site with this site number already exists");

        try
        {
            // Create domain entity
            var pollSite = new PollSite(
                input.SiteNumber, input.FacilityName, input.BuildingTypeId,
                input.FacilityStatusId, input.FacilityAccessibilityId,
                input.HouseNumber, input.StreetName, input.City, input.State,
                input.ZipCode, input.CountyId, input.PolicePrecinctId,
                input.MAddress1, input.MCity, input.MState, input.MZipCode, createdBy);

            // Save to repository
            var pollSiteId = await _pollSiteRepository.SaveAsync(pollSite);

            // Notify logistics
            await _notificationGateway.NotifyLogisticsAsync(
                $"New poll site created: {input.FacilityName} - {input.SiteNumber}");

            return pollSiteId;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error creating poll site: {ex.Message}", ex);
        }
    }
}