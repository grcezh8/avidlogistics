namespace AVIDLogistics.Application.DTOs
{
    public record RegisterAssetInput(
        string SerialNumber,
        string AssetType,
        string? Barcode = null,
        string? RfidTag = null,
        string? Condition = null,
        string? Location = null,
        int Quantity = 1
    );
}
