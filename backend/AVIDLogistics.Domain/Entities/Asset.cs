using System;
using System.Collections.Generic;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Domain.Entities
{
    public class Asset
    {
        public int Id { get; private set; }
        public string SerialNumber { get; private set; } = string.Empty;
        public string AssetType { get; private set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? RfidTag { get; set; }
        public AssetStatus Status { get; private set; }
        public AssetCondition Condition { get; private set; }
        public string? Location { get; private set; }
        public int? FacilityId { get; private set; }
        public DateTime RegisteredDate { get; private set; }
        public DateTime? CreatedDate { get; private set; }
        public DateTime? ModifiedDate { get; private set; }

        // Navigation property for Kit relationship
        public ICollection<AssetKit> AssetKits { get; private set; } = new List<AssetKit>();

        // Parameterless constructor for EF Core
        private Asset() 
        {
            // Always generate a barcode to prevent NULL constraint violations
            Barcode = $"BC-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public Asset(string serialNumber, string assetType)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                throw new InvalidAssetException("Serial number is required");
            if (string.IsNullOrWhiteSpace(assetType))
                throw new InvalidAssetException("Asset type is required");

            SerialNumber = serialNumber;
            AssetType = assetType;
            Status = AssetStatus.Available;
            Condition = AssetCondition.New;
            RegisteredDate = DateTime.UtcNow;
            CreatedDate = DateTime.UtcNow;
            ModifiedDate = DateTime.UtcNow;
            
            // Always generate a barcode in constructor to prevent NULL values
            Barcode = $"BC-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public static Asset CreateNew(string assetType, string? serialNumber = null, string? barcode = null, string? rfidTag = null, string? location = null, int? facilityId = null)
        {
            var finalSerialNumber = !string.IsNullOrWhiteSpace(serialNumber) 
                ? serialNumber 
                : $"SN-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
            
            var asset = new Asset(finalSerialNumber, assetType);
            
            // Always generate a barcode to avoid NULL constraint issues
            asset.Barcode = !string.IsNullOrWhiteSpace(barcode) 
                ? barcode 
                : $"BC-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                
            // Generate RFID tag if none provided to ensure uniqueness
            asset.RfidTag = !string.IsNullOrWhiteSpace(rfidTag) 
                ? rfidTag 
                : $"RFID-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                
            asset.Location = location ?? "Warehouse";
            asset.FacilityId = facilityId;
            
            return asset;
        }

        public static Asset CreateWithSerialNumber(string serialNumber, string assetType, string? barcode = null, string? rfidTag = null, string? location = null, int? facilityId = null)
        {
            var asset = new Asset(serialNumber, assetType);
            
            asset.Barcode = !string.IsNullOrWhiteSpace(barcode) 
                ? barcode 
                : $"BC-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                
            asset.RfidTag = rfidTag;
            asset.Location = location ?? "Warehouse";
            asset.FacilityId = facilityId;
            
            return asset;
        }

        public void Register(string barcode, string rfidTag = null)
        {
            Barcode = barcode ?? throw new ArgumentNullException(nameof(barcode));
            RfidTag = rfidTag;
            Status = AssetStatus.Available;
            Location = "Warehouse";
            ModifiedDate = DateTime.UtcNow;
        }

        public void AssignToManifest()
        {
            if (Status != AssetStatus.Available)
                throw new InvalidAssetStateException($"Cannot assign asset in {Status} status");

            Status = AssetStatus.Pending;
            ModifiedDate = DateTime.UtcNow;
        }

        public void AssignToKit(int kitId)
        {
            if (Status != AssetStatus.Available)
                throw new InvalidAssetStateException($"Cannot assign asset in {Status} status");

            Status = AssetStatus.Pending;
            ModifiedDate = DateTime.UtcNow;
        }

        public void MarkPacked()
        {
            if (Status != AssetStatus.Pending)
                throw new InvalidAssetStateException($"Cannot mark asset as packed from {Status} status");

            // Asset remains in Pending status during packing process
            ModifiedDate = DateTime.UtcNow;
        }

        public void MarkInTransit()
        {
            if (Status != AssetStatus.Pending)
                throw new InvalidAssetStateException($"Cannot mark asset in transit from {Status} status");

            // Asset remains in Pending status during transit
            ModifiedDate = DateTime.UtcNow;
        }

        public void Deploy(string location)
        {
            if (Status != AssetStatus.Pending)
                throw new InvalidAssetStateException($"Cannot deploy asset from {Status} status");

            Status = AssetStatus.Unavailable;
            Location = location;
            ModifiedDate = DateTime.UtcNow;
        }

        public void ConfirmDelivery(string location)
        {
            if (Status != AssetStatus.Pending)
                throw new InvalidAssetStateException($"Cannot confirm delivery for asset in {Status} status");

            Status = AssetStatus.Unavailable;
            Location = location;
            ModifiedDate = DateTime.UtcNow;
        }

        public void ReturnToWarehouse()
        {
            Status = AssetStatus.Available;
            Location = "Warehouse";
            ModifiedDate = DateTime.UtcNow;
        }

        public void UpdateCondition(AssetCondition condition)
        {
            Condition = condition;
            if (condition == AssetCondition.Retired)
            {
                Status = AssetStatus.Unavailable;
            }
            ModifiedDate = DateTime.UtcNow;
        }

        public void StartMaintenance()
        {
            if (Status == AssetStatus.Unavailable && Condition == AssetCondition.Retired)
                throw new InvalidAssetStateException("Cannot maintain retired asset");

            Status = AssetStatus.Unavailable;
            ModifiedDate = DateTime.UtcNow;
        }

        public void CompleteMaintenance(AssetCondition resultingCondition)
        {
            if (Status != AssetStatus.Unavailable)
                throw new InvalidAssetStateException("Asset is not in maintenance");

            Condition = resultingCondition;
            Status = resultingCondition == AssetCondition.Retired 
                ? AssetStatus.Unavailable 
                : AssetStatus.Available;
            ModifiedDate = DateTime.UtcNow;
        }
}
}
