using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdatePollSiteLocationUseCase
{
    private readonly IPollSiteRepository _pollSiteRepository;

    public UpdatePollSiteLocationUseCase(IPollSiteRepository pollSiteRepository)
    {
        _pollSiteRepository = pollSiteRepository;
    }

    public async Task ExecuteAsync(int pollSiteId, string houseNumber, string streetName,
        string city, string state, string zipCode, decimal? latitude, decimal? longitude, int modifiedBy)
    {
        var pollSite = await _pollSiteRepository.GetByIdAsync(pollSiteId);
        if (pollSite == null)
            throw new PollSiteNotFoundException($"Poll site {pollSiteId} not found");

        pollSite.UpdateLocation(houseNumber, streetName, city, state, zipCode, latitude, longitude, modifiedBy);
        await _pollSiteRepository.UpdateAsync(pollSite);
    }
}