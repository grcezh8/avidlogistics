namespace AVIDLogistics.Domain.Enums
{
    public enum AssetStatus
    {
        Available = 0,    // Assets in inventory, ready for use (includes unregistered)
        Pending = 1,      // Assets being packed, assigned, or in transit
        Unavailable = 2   // Assets deployed or in use at poll sites
    }
}
