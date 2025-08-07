namespace AVIDLogistics.Application.DTOs
{
    public class ManifestSummaryDto
    {
        public int ManifestId { get; set; }
        public string ManifestNumber { get; set; } = string.Empty;
        public int ElectionId { get; set; }
        public int FromFacilityId { get; set; }
        public int ToPollSiteId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public int PackedCount { get; set; }
    }
}
