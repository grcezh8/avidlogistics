using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class DeactivatePoliticalDistrictUseCase
{
    private readonly IPoliticalDistrictRepository _politicalDistrictRepository;

    public DeactivatePoliticalDistrictUseCase(IPoliticalDistrictRepository politicalDistrictRepository)
    {
        _politicalDistrictRepository = politicalDistrictRepository;
    }

    public async Task ExecuteAsync(int districtId)
    {
        var district = await _politicalDistrictRepository.GetByIdAsync(districtId);
        if (district == null)
            throw new PoliticalDistrictNotFoundException($"Political district {districtId} not found");

        district.Deactivate();
        await _politicalDistrictRepository.UpdateAsync(district);
    }
}