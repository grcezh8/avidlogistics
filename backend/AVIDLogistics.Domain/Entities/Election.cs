using System;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class Election
    {
        public int ElectionId { get; private set; }
        public string Name { get; private set; }
        public DateTime ElectionDate { get; private set; }
        public string ElectionType { get; private set; }
        public ElectionStatus Status { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public int? ModifiedBy { get; private set; }
        public DateTime? ModifiedDate { get; private set; }

        public Election(string name, DateTime electionDate, string electionType, int createdBy)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            ElectionDate = electionDate;
            ElectionType = electionType ?? throw new ArgumentNullException(nameof(electionType));
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            Status = ElectionStatus.Planning;
        }

        public void UpdateStatus(ElectionStatus status, int modifiedBy)
        {
            Status = status;
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }

        public void Reschedule(DateTime newElectionDate)
        {
            if (Status == ElectionStatus.Completed || Status == ElectionStatus.Cancelled)
                throw new InvalidElectionStateException($"Cannot reschedule election in {Status} status");

            ElectionDate = newElectionDate;
        }
    }
}
