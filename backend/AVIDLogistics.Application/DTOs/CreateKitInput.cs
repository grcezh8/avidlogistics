
    public record CreateKitInput(
        string Name,
        string KitType,
        List<int> AssetIds
    );