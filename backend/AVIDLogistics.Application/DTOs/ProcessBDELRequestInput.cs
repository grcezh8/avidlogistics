    public record ProcessBDELRequestInput(
        int RequestId,
        bool Approve,
        string AdminDecisionId
    );