using System.ComponentModel.DataAnnotations;

namespace AVIDLogistics.Application.DTOs
{
    public class CreateManifestWithAssetsInput
    {
        [Required]
        public int PollSiteId { get; set; }
        
        [Required]
        public int ElectionId { get; set; }
        
        [Required]
        [MinLength(1, ErrorMessage = "At least one asset must be selected")]
        public List<int> AssetIds { get; set; } = new();
        
        public int FromFacilityId { get; set; } = 1; // Default to main warehouse
        
        public string? Notes { get; set; }
    }
}
