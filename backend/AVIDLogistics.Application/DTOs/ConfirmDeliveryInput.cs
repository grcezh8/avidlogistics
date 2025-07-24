
    public record ConfirmDeliveryInput(
        int ManifestId,
        string Signature,
        string Location
    );