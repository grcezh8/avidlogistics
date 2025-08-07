using System;
using System.Collections.Generic;
using System.Linq;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class Manifest
    {
        private readonly List<ManifestItem> _items = new();

        public int ManifestId { get; private set; }
        public string ManifestNumber { get; private set; } = string.Empty;
        public int ElectionId { get; private set; }
        public int FromFacilityId { get; private set; }
        public int ToPollSiteId { get; private set; }
        public ManifestStatus Status { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public DateTime? PackedDate { get; private set; }
        public IReadOnlyList<ManifestItem> Items => _items.AsReadOnly();

        // Parameterless constructor for EF Core
        private Manifest()
        {
        }

        public Manifest(int electionId, int fromFacilityId, int toPollSiteId, int createdBy)
        {
            ElectionId = electionId;
            FromFacilityId = fromFacilityId;
            ToPollSiteId = toPollSiteId;
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            Status = ManifestStatus.Draft;
            ManifestNumber = $"MAN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public void AddItem(int assetId, string sealNumber)
        {
            if (Status != ManifestStatus.Draft)
                throw new InvalidManifestStateException($"Cannot add items to manifest in {Status} status");

            var item = new ManifestItem(ManifestId, assetId, sealNumber);
            _items.Add(item);
        }

        public void RemoveItem(int assetId)
        {
            if (Status != ManifestStatus.Draft)
                throw new InvalidManifestStateException($"Cannot remove items from manifest in {Status} status");

            var item = _items.FirstOrDefault(i => i.AssetId == assetId);
            if (item != null)
                _items.Remove(item);
        }

        public void ReadyForPacking()
        {
            if (Status != ManifestStatus.Draft)
                throw new InvalidManifestStateException($"Cannot ready manifest for packing in {Status} status");

            if (!_items.Any())
                throw new InvalidManifestStateException("Cannot ready empty manifest for packing");

            Status = ManifestStatus.ReadyForPacking;
        }

        public void MarkItemPacked(int assetId, int packedBy)
        {
            if (Status != ManifestStatus.ReadyForPacking && Status != ManifestStatus.PartiallyPacked)
                throw new InvalidManifestStateException($"Cannot pack items in manifest with {Status} status");

            var item = _items.FirstOrDefault(i => i.AssetId == assetId);
            if (item == null)
                throw new ArgumentException("Asset not found in manifest");

            item.MarkPacked(packedBy);

            if (_items.All(i => i.IsPacked))
            {
                Status = ManifestStatus.FullyPacked;
                PackedDate = DateTime.UtcNow;
            }
            else if (_items.Any(i => i.IsPacked))
            {
                Status = ManifestStatus.PartiallyPacked;
            }
        }

        public void Complete()
        {
            if (Status != ManifestStatus.FullyPacked)
                throw new InvalidManifestStateException($"Cannot complete manifest in {Status} status");

            Status = ManifestStatus.Completed;
        }
    }
}
