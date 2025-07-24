using System;

namespace AVIDLogistics.Domain.ValueObjects
{
    public class DiscrepancyRecord
    {
        public int Id { get; private set; }
        public int AssetId { get; private set; }
        public string ExpectedLocation { get; private set; }
        public string ActualLocation { get; private set; }
        public string Notes { get; private set; }
        public bool IsResolved { get; private set; }
        public string Resolution { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public DateTime? ResolvedDate { get; private set; }

        public DiscrepancyRecord(int assetId, string expectedLocation, string actualLocation, string notes)
        {
            AssetId = assetId;
            ExpectedLocation = expectedLocation;
            ActualLocation = actualLocation;
            Notes = notes;
            IsResolved = false;
            CreatedDate = DateTime.UtcNow;
        }

        public void Resolve(string resolution)
        {
            if (IsResolved)
                throw new InvalidOperationException("Discrepancy already resolved");

            Resolution = resolution ?? throw new ArgumentNullException(nameof(resolution));
            IsResolved = true;
            ResolvedDate = DateTime.UtcNow;
        }
    }
}
