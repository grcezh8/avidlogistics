using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CreatePoliticalDistrictUseCase
{
    private readonly IPoliticalDistrictRepository _politicalDistrictRepository;

    public CreatePoliticalDistrictUseCase(IPoliticalDistrictRepository politicalDistrictRepository)
    {
        _politicalDistrictRepository = politicalDistrictRepository;
    }

    public async Task<int> ExecuteAsync(string districtKey, string description, string districtType,
        string abbreviation = null, int? parentDistrictId = null)
    {
        if (string.IsNullOrWhiteSpace(districtKey))
            throw new ArgumentException("District key is required");

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required");

        var district = new PoliticalDistrict(districtKey, description, districtType, abbreviation, parentDistrictId);
        return await _politicalDistrictRepository.SaveAsync(district);
    }
}