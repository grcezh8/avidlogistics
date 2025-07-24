    public record MissingSealAlert(
        int AssetId,
        string AssetSerialNumber,
        int ElectionId,
        string ElectionName,
        string ExpectedSealNumber,
        DateTime LastUpdated
    );