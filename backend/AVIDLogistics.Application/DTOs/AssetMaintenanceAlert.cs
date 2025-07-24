    public record AssetMaintenanceAlert(
        int AssetId,
        string AssetSerialNumber,
        string AssetType,
        string Condition,
        DateTime LastMaintenanceDate,
        int DaysSinceLastMaintenance
    );