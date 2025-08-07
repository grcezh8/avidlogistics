using System;

namespace AVIDLogistics.Domain.Entities
{
    public class ChainOfCustodyEvent
    {
        public int EventId { get; private set; }
        public int ElectionId { get; private set; }
        public int AssetId { get; private set; }
        public string FromParty { get; private set; }
        public string ToParty { get; private set; }
        public DateTime DateTime { get; private set; }
        public string SealNumber { get; private set; }
        public int CreatedBy { get; private set; }
        public string Notes { get; private set; }
        public int? ScannedFormId { get; private set; }
        public ScannedForm? ScannedForm { get; private set; }
        public string EventType { get; private set; }
        public string FromOrg { get; private set; }
        public string ToOrg { get; private set; }
        public string SignatureImageUrl { get; private set; }
        public int? ManifestId { get; private set; }

        public ChainOfCustodyEvent(
            int electionId,
            int assetId,
            string fromParty,
            string toParty,
            string? sealNumber,
            int createdBy,
            string? notes = null,
            int? scannedFormId = null,
            string eventType = "Transfer",
            string? fromOrg = null,
            string? toOrg = null,
            string? signatureImageUrl = null,
            int? manifestId = null)
        {
            ElectionId         = electionId;
            AssetId            = assetId;
            FromParty          = fromParty ?? throw new ArgumentNullException(nameof(fromParty));
            ToParty            = toParty   ?? throw new ArgumentNullException(nameof(toParty));
            SealNumber         = sealNumber ?? string.Empty;
            CreatedBy          = createdBy;
            Notes              = notes;
            ScannedFormId      = scannedFormId;
            EventType          = eventType ?? "Transfer";
            FromOrg            = fromOrg;
            ToOrg              = toOrg;
            SignatureImageUrl  = signatureImageUrl;
            ManifestId         = manifestId;
            DateTime           = DateTime.UtcNow;
        }
    }
}
