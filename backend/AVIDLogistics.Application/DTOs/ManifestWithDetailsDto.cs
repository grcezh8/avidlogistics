namespace AVIDLogistics.Application.DTOs
{
    public class ManifestWithDetailsDto
    {
        public int ManifestId { get; set; }
        public string ManifestNumber { get; set; } = string.Empty;
        public int ElectionId { get; set; }
        public int FromFacilityId { get; set; }
        public int ToPollSiteId { get; set; }
        public string PollSiteName { get; set; } = string.Empty;
        public string PollSiteDisplayName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public int PackedCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? PackedDate { get; set; }
        public List<ManifestItemDto> Items { get; set; } = new();
    }

    public class ManifestItemDto
    {
        public int ManifestItemId { get; set; }
        public int AssetId { get; set; }
        public string AssetSerialNumber { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public string SealNumber { get; set; } = string.Empty;
        public bool IsPacked { get; set; }
        public DateTime? PackedDate { get; set; }
        public int? PackedBy { get; set; }
    }
}
