using System;
using System.Collections.Generic;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class DeliveryManifest
    {
        private readonly List<int> _kitIds = new();

        public int Id { get; private set; }
        public string ManifestNumber { get; private set; }
        public int PollSiteId { get; private set; }
        public DeliveryStatus Status { get; private set; }
        public int? TruckId { get; private set; }
        public int? DriverId { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public DateTime? DeliveredDate { get; private set; }
        public string Signature { get; private set; }
        public IReadOnlyList<int> KitIds => _kitIds.AsReadOnly();

        public DeliveryManifest(int pollSiteId)
        {
            PollSiteId = pollSiteId;
            Status = DeliveryStatus.Created;
            CreatedDate = DateTime.UtcNow;
            ManifestNumber = $"MAN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public void AddKit(int kitId)
        {
            if (Status != DeliveryStatus.Created)
                throw new InvalidDeliveryStateException($"Cannot add kits to manifest in {Status} status");

            if (!_kitIds.Contains(kitId))
                _kitIds.Add(kitId);
        }

        public void AssignDriver(int truckId, int driverId)
        {
            if (Status != DeliveryStatus.Created)
                throw new InvalidDeliveryStateException($"Cannot assign driver to manifest in {Status} status");

            TruckId = truckId;
            DriverId = driverId;
            Status = DeliveryStatus.DriverAssigned;
        }

        public void MarkInTransit()
        {
            if (Status != DeliveryStatus.DriverAssigned)
                throw new InvalidDeliveryStateException($"Cannot mark manifest in transit from {Status} status");

            Status = DeliveryStatus.InTransit;
        }

        public void ConfirmDelivery(string signature)
        {
            if (Status != DeliveryStatus.InTransit)
                throw new InvalidDeliveryStateException($"Cannot confirm delivery for manifest in {Status} status");

            Signature = signature ?? throw new ArgumentNullException(nameof(signature));
            DeliveredDate = DateTime.UtcNow;
            Status = DeliveryStatus.Delivered;
        }
    }
}
