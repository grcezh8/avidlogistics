using System;

namespace AVIDLogistics.Application.DTOs
{
    public class KitSummaryDto
    {
        public int KitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? PollSiteId { get; set; }
        public string? PollSiteName { get; set; }
        public int AssetCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? ManifestId { get; set; }
        public string? ManifestNumber { get; set; }
    }
}
