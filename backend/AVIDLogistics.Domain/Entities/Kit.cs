using System;
using System.Collections.Generic;
using System.Linq;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class Kit
    {
        private readonly List<AssetKit> _assetKits = new();

        public int Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public KitType Type { get; private set; }
        public KitStatus Status { get; private set; }
        public int? PollSiteId { get; private set; }
        public DateTime CreatedDate { get; private set; }
        
        // Navigation property for EF Core
        public ICollection<AssetKit> AssetKits { get; private set; } = new List<AssetKit>();
        
        // Helper property to get asset IDs
        public IEnumerable<int> GetAssetIds() => AssetKits.Select(ak => ak.AssetId);

        // Parameterless constructor for EF Core
        private Kit()
        {
        }

        public Kit(string name, KitType type)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Type = type;
            Status = KitStatus.Draft;
            CreatedDate = DateTime.UtcNow;
        }

        public void AddAsset(int assetId, int assignedBy)
        {
            if (Status != KitStatus.Draft)
                throw new InvalidKitStateException($"Cannot add assets to kit in {Status} status");

            if (!AssetKits.Any(ak => ak.AssetId == assetId))
            {
                var assetKit = new AssetKit(assetId, Id, assignedBy);
                AssetKits.Add(assetKit);
            }
        }

        public void RemoveAsset(int assetId)
        {
            if (Status != KitStatus.Draft)
                throw new InvalidKitStateException($"Cannot remove assets from kit in {Status} status");

            var assetKit = AssetKits.FirstOrDefault(ak => ak.AssetId == assetId);
            if (assetKit != null)
            {
                AssetKits.Remove(assetKit);
            }
        }

        public void AssignToPollSite(int pollSiteId)
        {
            if (Status != KitStatus.Draft)
                throw new InvalidKitStateException($"Cannot assign kit in {Status} status");

            PollSiteId = pollSiteId;
            Status = KitStatus.Assigned;
        }

        public void MarkPacked()
        {
            if (Status != KitStatus.Assigned)
                throw new InvalidKitStateException($"Cannot pack kit in {Status} status");

            Status = KitStatus.Packed;
        }

        public void MarkReadyForDispatch()
        {
            if (Status != KitStatus.Packed)
                throw new InvalidKitStateException($"Cannot mark kit ready for dispatch in {Status} status");

            Status = KitStatus.ReadyForDispatch;
        }
    }
}
