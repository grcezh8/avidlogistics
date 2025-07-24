namespace AVIDLogistics.Application.DTOs
{
    public class CreateChainOfCustodyEventInput
    {
        public int AssetId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Notes { get; set; } = string.Empty;

        public int ElectionId { get; set; }
        public string FromParty { get; set; } = string.Empty;
        public string ToParty { get; set; } = string.Empty;
        public string SealNumber { get; set; } = string.Empty;
    }
}
