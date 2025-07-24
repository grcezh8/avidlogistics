namespace AVIDLogistics.Application.DTOs
{
    public record RegisterAssetOutput(
        int AssetId,
        string Barcode,
        bool Success,
        string Message
    );
}
