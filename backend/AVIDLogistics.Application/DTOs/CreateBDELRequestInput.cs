    public record CreateBDELRequestInput(
        int? EventId,
        int? MapId,
        int? FromFacilityId,
        int? ToFacilityId,
        int? BDELReasonId,
        string Notes,
        List<BDELRequestItemInput> Items
    );