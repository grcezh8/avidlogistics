    public record DiscrepancyAlert(
        int DiscrepancyId,
        int AssetId,
        string AssetSerialNumber,
        string ExpectedLocation,
        string ActualLocation,
        DateTime CreatedDate,
        int DaysUnresolved
    );