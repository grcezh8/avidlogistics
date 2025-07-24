using System;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class ElectionEvent
    {
        public int EventId { get; private set; }
        public string Name { get; private set; }
        public DateTime EventDate { get; private set; }
        public string EventType { get; private set; }
        public int MapId { get; private set; }
        public ElectionStatus Status { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }

        public ElectionEvent(string name, DateTime eventDate, string eventType, int mapId, int createdBy)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            EventDate = eventDate;
            EventType = eventType ?? throw new ArgumentNullException(nameof(eventType));
            MapId = mapId;
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            Status = ElectionStatus.Planning;
        }

        public void UpdateStatus(ElectionStatus status)
        {
            Status = status;
        }

        public void Reschedule(DateTime newEventDate)
        {
            if (Status == ElectionStatus.Completed || Status == ElectionStatus.Cancelled)
                throw new InvalidElectionStateException($"Cannot reschedule event in {Status} status");

            EventDate = newEventDate;
        }
    }
}
