using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class FacilityService
{
    private readonly IFacilityRepository _facilityRepository;
    private readonly INotificationGateway _notificationGateway;

    public FacilityService(IFacilityRepository facilityRepository, INotificationGateway notificationGateway)
    {
        _facilityRepository = facilityRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> CreateFacilityAsync(CreateFacilityInput input, int createdBy)
    {
        if (await _facilityRepository.ExistsAsync(input.Name))
            throw new InvalidOperationException("Facility with this name already exists");

        var facility = new Facility(input.Name, input.Address);
        var facilityId = await _facilityRepository.SaveAsync(facility);

        await _notificationGateway.NotifyWarehouseAsync($"New facility created: {input.Name}");
        return facilityId;
    }

    public async Task UpdateFacilityAsync(UpdateFacilityInput input, int modifiedBy)
    {
        var facility = await _facilityRepository.GetByIdAsync(input.FacilityId);
        if (facility == null)
            throw new FacilityNotFoundException($"Facility {input.FacilityId} not found");

        facility.UpdateAddress(input.Address, null);
        await _facilityRepository.UpdateAsync(facility);
    }

    public async Task<List<Facility>> GetAllActiveFacilitiesAsync()
    {
        return await _facilityRepository.GetAllActiveAsync();
    }

    public async Task<Facility> GetFacilityByIdAsync(int facilityId)
    {
        return await _facilityRepository.GetByIdAsync(facilityId);
    }

    public async Task DeactivateFacilityAsync(int facilityId, int modifiedBy)
    {
        var facility = await _facilityRepository.GetByIdAsync(facilityId);
        if (facility == null)
            throw new FacilityNotFoundException($"Facility {facilityId} not found");

        facility.Deactivate();
        await _facilityRepository.UpdateAsync(facility);
    }
}
