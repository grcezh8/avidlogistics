    public record CreateElectionEventInput(
        string Name,
        DateTime EventDate,
        string EventType,
        int MapId
    );