    public record CreateDeliveryManifestInput(
        int PollSiteId,
        List<int> KitIds
    );