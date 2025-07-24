    public record AssetStatusReport(
        int AssetId,
        string SerialNumber,
        string AssetType,
        string Status,
        string Condition,
        string Location,
        int? FacilityId,
        string FacilityName
    );