using System;

namespace AVIDLogistics.Domain.Entities
{
    public class ManifestItem
    {
        public int ManifestItemId { get; private set; }
        public int ManifestId { get; private set; }
        public int AssetId { get; private set; }
        public string SealNumber { get; private set; }
        public bool IsPacked { get; private set; }
        public int? PackedBy { get; private set; }
        public DateTime? PackedDate { get; private set; }

        public ManifestItem(int manifestId, int assetId, string sealNumber)
        {
            ManifestId = manifestId;
            AssetId = assetId;
            SealNumber = sealNumber;
            IsPacked = false;
        }

        public void MarkPacked(int packedBy)
        {
            if (IsPacked)
                throw new InvalidOperationException("Item is already packed");

            IsPacked = true;
            PackedBy = packedBy;
            PackedDate = DateTime.UtcNow;
        }
    }
}
