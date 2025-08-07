using System;

namespace AVIDLogistics.Domain.Entities
{
    public class AssetKit
    {
        public int AssetId { get; private set; }
        public int KitId { get; private set; }
        public DateTime AssignedDate { get; private set; }
        public int AssignedBy { get; private set; }

        // Navigation properties
        public Asset Asset { get; private set; } = null!;
        public Kit Kit { get; private set; } = null!;

        // Parameterless constructor for EF Core
        private AssetKit()
        {
        }

        public AssetKit(int assetId, int kitId, int assignedBy)
        {
            AssetId = assetId;
            KitId = kitId;
            AssignedBy = assignedBy;
            AssignedDate = DateTime.UtcNow;
        }
    }
}
