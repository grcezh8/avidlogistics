using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdatePollSiteUseCase
{
    private readonly IPollSiteRepository _pollSiteRepository;

    public UpdatePollSiteUseCase(IPollSiteRepository pollSiteRepository)
    {
        _pollSiteRepository = pollSiteRepository;
    }

    public async Task ExecuteAsync(UpdatePollSiteInput input, int modifiedBy)
    {
        // Get poll site
        var pollSite = await _pollSiteRepository.GetByIdAsync(input.PollSiteId);
        if (pollSite == null)
            throw new PollSiteNotFoundException($"Poll site {input.PollSiteId} not found");

        // Update facility info
        pollSite.UpdateFacilityInfo(input.FacilityName, input.BuildingTypeId,
            input.FacilityStatusId, input.FacilityAccessibilityId, modifiedBy);

        await _pollSiteRepository.UpdateAsync(pollSite);
    }
}