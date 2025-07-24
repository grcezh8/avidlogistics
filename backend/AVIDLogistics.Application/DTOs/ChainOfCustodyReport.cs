    public record ChainOfCustodyReport(
        int EventId,
        int ElectionId,
        string ElectionName,
        int AssetId,
        string AssetSerialNumber,
        string FromParty,
        string ToParty,
        DateTime DateTime,
        string SealNumber,
        string Notes
    );