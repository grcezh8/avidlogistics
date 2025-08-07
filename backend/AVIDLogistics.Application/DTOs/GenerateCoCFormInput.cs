namespace AVIDLogistics.Application.DTOs
{
    public class GenerateCoCFormInput
    {
        public int ManifestId { get; set; }
        public int RequiredSignatures { get; set; } = 2;
        public int ExpirationDays { get; set; } = 30;
        public string? BaseUrl { get; set; }
    }
}
