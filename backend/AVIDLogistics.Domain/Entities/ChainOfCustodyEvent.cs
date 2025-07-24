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

        public ChainOfCustodyEvent(int electionId, int assetId, string fromParty, string toParty, 
            string sealNumber, int createdBy, string notes = null)
        {
            ElectionId = electionId;
            AssetId = assetId;
            FromParty = fromParty ?? throw new ArgumentNullException(nameof(fromParty));
            ToParty = toParty ?? throw new ArgumentNullException(nameof(toParty));
            SealNumber = sealNumber;
            CreatedBy = createdBy;
            Notes = notes;
            DateTime = DateTime.UtcNow;
        }
    }
}
