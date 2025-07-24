using System;
using System.Collections.Generic;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Domain.Entities
{
    public class BDELRequest
    {
        private readonly List<BDELRequestItem> _items = new();

        public int RequestId { get; private set; }
        public string RequestNumber { get; private set; }
        public int? EventId { get; private set; }
        public int? MapId { get; private set; }
        public int? FromFacilityId { get; private set; }
        public int? ToFacilityId { get; private set; }
        public int? BDELReasonId { get; private set; }
        public int RequestedBy { get; private set; }
        public DateTime RequestedDate { get; private set; }
        public string Notes { get; private set; }
        public BDELStatus Status { get; private set; }
        public string AdminDecisionId { get; private set; }
        public DateTime? DecisionDate { get; private set; }
        public IReadOnlyList<BDELRequestItem> Items => _items.AsReadOnly();

        public BDELRequest(int? eventId, int? mapId, int? fromFacilityId,
            int? toFacilityId, int? bdelReasonId, int requestedBy, string notes)
        {
            EventId = eventId;
            MapId = mapId;
            FromFacilityId = fromFacilityId;
            ToFacilityId = toFacilityId;
            BDELReasonId = bdelReasonId;
            RequestedBy = requestedBy;
            RequestedDate = DateTime.UtcNow;
            Notes = notes;
            Status = BDELStatus.Pending;
            RequestNumber = $"BDEL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public void AddItem(int edid, string itemDescription, int quantity)
        {
            if (Status != BDELStatus.Pending)
                throw new InvalidOperationException($"Cannot add items to request in {Status} status");

            var item = new BDELRequestItem(RequestId, edid, itemDescription, quantity);
            _items.Add(item);
        }

        public void Approve(string adminDecisionId)
        {
            if (Status != BDELStatus.Pending)
                throw new InvalidOperationException($"Cannot approve request in {Status} status");

            Status = BDELStatus.Approved;
            AdminDecisionId = adminDecisionId;
            DecisionDate = DateTime.UtcNow;
        }

        public void Reject(string adminDecisionId)
        {
            if (Status != BDELStatus.Pending)
                throw new InvalidOperationException($"Cannot reject request in {Status} status");

            Status = BDELStatus.Rejected;
            AdminDecisionId = adminDecisionId;
            DecisionDate = DateTime.UtcNow;
        }
    }
}
