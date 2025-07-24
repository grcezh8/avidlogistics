using System;
using System.Collections.Generic;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Domain.Entities
{
    public class Kit
    {
        private readonly List<int> _assetIds = new();

        public int Id { get; private set; }
        public string Name { get; private set; }
        public KitType Type { get; private set; }
        public KitStatus Status { get; private set; }
        public int? PollSiteId { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public IReadOnlyList<int> AssetIds => _assetIds.AsReadOnly();

        public Kit(string name, KitType type)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Type = type;
            Status = KitStatus.Draft;
            CreatedDate = DateTime.UtcNow;
        }

        public void AddAsset(int assetId)
        {
            if (Status != KitStatus.Draft)
                throw new InvalidKitStateException($"Cannot add assets to kit in {Status} status");

            if (!_assetIds.Contains(assetId))
                _assetIds.Add(assetId);
        }

        public void RemoveAsset(int assetId)
        {
            if (Status != KitStatus.Draft)
                throw new InvalidKitStateException($"Cannot remove assets from kit in {Status} status");

            _assetIds.Remove(assetId);
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
