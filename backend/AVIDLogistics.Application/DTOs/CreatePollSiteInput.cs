    public record CreatePollSiteInput(
        string SiteNumber,
        string FacilityName,
        int BuildingTypeId,
        int FacilityStatusId,
        int FacilityAccessibilityId,
        string HouseNumber,
        string StreetName,
        string City,
        string State,
        string ZipCode,
        int CountyId,
        int PolicePrecinctId,
        string MAddress1,
        string MCity,
        string MState,
        string MZipCode
    );