using System;
using System.Collections.Generic;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
using AVIDLogistics.Domain.ValueObjects;

namespace AVIDLogistics.Domain.Entities
{
    public class Asset
    {
        private readonly List<MaintenanceRecord> _maintenanceHistory = new();

        public int Id { get; private set; }
        public string SerialNumber { get; private set; }
        public string AssetType { get; private set; }
        public string Barcode { get; private set; }
        public string RfidTag { get; private set; }
        public AssetStatus Status { get; private set; }
        public AssetCondition Condition { get; private set; }
        public string Location { get; private set; }
        public int? FacilityId { get; private set; }
        public int? ElectionId { get; private set; }
        public DateTime RegisteredDate { get; private set; }
        public IReadOnlyList<MaintenanceRecord> MaintenanceHistory => _maintenanceHistory.AsReadOnly();

        public Asset(string serialNumber, string assetType)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                throw new InvalidAssetException("Serial number is required");
            if (string.IsNullOrWhiteSpace(assetType))
                throw new InvalidAssetException("Asset type is required");

            SerialNumber = serialNumber;
            AssetType = assetType;
            Status = AssetStatus.Unregistered;
            Condition = AssetCondition.New;
            RegisteredDate = DateTime.UtcNow;
        }

        public void Register(string barcode, string rfidTag = null)
        {
            if (Status != AssetStatus.Unregistered)
                throw new InvalidAssetStateException($"Cannot register asset in {Status} status");

            Barcode = barcode ?? throw new ArgumentNullException(nameof(barcode));
            RfidTag = rfidTag;
            Status = AssetStatus.Available;
            Location = "Warehouse";
        }

        public void AssignToKit(int kitId)
        {
            if (Status != AssetStatus.Available)
                throw new InvalidAssetStateException($"Cannot assign asset in {Status} status");

            Status = AssetStatus.Assigned;
        }

        public void MarkInTransit()
        {
            if (Status != AssetStatus.Assigned)
                throw new InvalidAssetStateException($"Cannot mark asset in transit from {Status} status");

            Status = AssetStatus.InTransit;
        }

        public void ConfirmDelivery(string location)
        {
            if (Status != AssetStatus.InTransit)
                throw new InvalidAssetStateException($"Cannot confirm delivery for asset in {Status} status");

            Status = AssetStatus.Deployed;
            Location = location;
        }

        public void ReturnToWarehouse()
        {
            Status = AssetStatus.Available;
            Location = "Warehouse";
        }

        public void UpdateCondition(AssetCondition condition)
        {
            Condition = condition;
            if (condition == AssetCondition.Retired)
            {
                Status = AssetStatus.OutOfService;
            }
        }

        public void StartMaintenance(MaintenanceRecord record)
        {
            if (Status == AssetStatus.OutOfService)
                throw new InvalidAssetStateException("Cannot maintain out-of-service asset");

            _maintenanceHistory.Add(record);
            Status = AssetStatus.InMaintenance;
        }

        public void CompleteMaintenance(AssetCondition resultingCondition)
        {
            if (Status != AssetStatus.InMaintenance)
                throw new InvalidAssetStateException("Asset is not in maintenance");

            Condition = resultingCondition;
            Status = resultingCondition == AssetCondition.Retired 
                ? AssetStatus.OutOfService 
                : AssetStatus.Available;
        }
    }
}
