    public record InventoryStatusReport(
        int FacilityId,
        string FacilityName,
        int TotalAssets,
        int AvailableAssets,
        int AssignedAssets,
        int InTransitAssets,
        int DeployedAssets,
        int MaintenanceAssets
    );