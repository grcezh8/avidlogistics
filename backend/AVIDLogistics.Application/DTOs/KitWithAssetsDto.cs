using System;
using System.Collections.Generic;

namespace AVIDLogistics.Application.DTOs
{
    public class KitWithAssetsDto
    {
        public int KitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? PollSiteId { get; set; }
        public string? PollSiteName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? ManifestId { get; set; }
        public string? ManifestNumber { get; set; }
        public List<KitAssetDto> Assets { get; set; } = new List<KitAssetDto>();
    }

    public class KitAssetDto
    {
        public int AssetId { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? SealNumber { get; set; }
        public DateTime AssignedDate { get; set; }
    }
}
