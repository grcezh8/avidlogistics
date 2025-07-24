namespace AVIDLogistics.Application.DTOs
{
    public record RegisterAssetInput(
        string SerialNumber,
        string AssetType,
        string Barcode,
        string RfidTag
    );
}
