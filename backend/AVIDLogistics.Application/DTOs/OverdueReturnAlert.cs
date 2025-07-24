    public record OverdueReturnAlert(
        int AssetId,
        string AssetSerialNumber,
        int ElectionId,
        string ElectionName,
        DateTime ExpectedReturnDate,
        int DaysOverdue
    );