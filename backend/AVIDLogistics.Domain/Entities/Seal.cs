using System;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class Seal
    {
        public int SealId { get; private set; }
        public string SealNumber { get; private set; }
        public SealStatus Status { get; private set; }
        public int? ElectionId { get; private set; }
        public int? AssetId { get; private set; }
        public int? AppliedBy { get; private set; }
        public DateTime? AppliedDate { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }

        public Seal(string sealNumber, int createdBy)
        {
            SealNumber = sealNumber ?? throw new ArgumentNullException(nameof(sealNumber));
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            Status = SealStatus.Available;
        }

        public void Apply(int electionId, int assetId, int appliedBy)
        {
            if (Status != SealStatus.Available)
                throw new InvalidSealStateException($"Cannot apply seal in {Status} status");

            ElectionId = electionId;
            AssetId = assetId;
            AppliedBy = appliedBy;
            AppliedDate = DateTime.UtcNow;
            Status = SealStatus.Applied;
        }

        public void MarkBroken()
        {
            if (Status != SealStatus.Applied)
                throw new InvalidSealStateException($"Cannot mark seal as broken in {Status} status");

            Status = SealStatus.Broken;
        }

        public void MarkLost()
        {
            Status = SealStatus.Lost;
        }
    }
}
