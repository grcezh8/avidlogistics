    public record ManifestStatusReport(
        int ManifestId,
        string ManifestNumber,
        int ElectionId,
        string ElectionName,
        string Status,
        int TotalItems,
        int PackedItems,
        DateTime CreatedDate,
        DateTime? PackedDate
    );