    public record SealUsageReport(
        int ElectionId,
        string ElectionName,
        int TotalSeals,
        int AvailableSeals,
        int AppliedSeals,
        int BrokenSeals,
        int LostSeals
    );