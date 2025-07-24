    public record UpdatePollSiteInput(
        int PollSiteId,
        string FacilityName,
        int BuildingTypeId,
        int FacilityStatusId,
        int FacilityAccessibilityId
    );