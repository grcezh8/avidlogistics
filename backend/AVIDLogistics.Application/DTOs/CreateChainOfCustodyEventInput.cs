namespace AVIDLogistics.Application.DTOs
{
    public class CreateChainOfCustodyEventInput
    {
        public int ElectionId { get; set; }
        public int AssetId { get; set; }
        public string FromParty { get; set; } = string.Empty;
        public string ToParty { get; set; } = string.Empty;
        public string? SealNumber { get; set; }
        public string? Notes { get; set; }
        public string? EventType { get; set; }
        public string? FromOrg { get; set; }
        public string? ToOrg { get; set; }
        public int? ManifestId { get; set; }
    }
}
