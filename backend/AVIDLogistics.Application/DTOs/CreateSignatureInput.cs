namespace AVIDLogistics.Application.DTOs
{
    public class CreateSignatureInput
    {
        public int ChainOfCustodyEventId { get; set; }
        public string SignedBy { get; set; } = string.Empty;
        public string SignatureType { get; set; } = "Digital";
        public string? SignatureImageUrl { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
