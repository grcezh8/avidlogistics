-- =============================================
-- Indexes for AVID Logistics Database
-- Production-ready indexes to optimize query performance
-- =============================================

-- ====================
-- Assets
-- ====================
CREATE INDEX IX_Assets_SerialNumber ON Assets (SerialNumber);
CREATE INDEX IX_Assets_Barcode ON Assets (Barcode) WHERE Barcode IS NOT NULL;
CREATE INDEX IX_Assets_RfidTag ON Assets (RfidTag) WHERE RfidTag IS NOT NULL;
CREATE INDEX IX_Assets_AssetTypeID ON Assets (AssetTypeID);
CREATE INDEX IX_Assets_StatusID ON Assets (StatusID);
CREATE INDEX IX_Assets_LocationID ON Assets (LocationID);

-- ====================
-- Locations
-- ====================
CREATE INDEX IX_Locations_Name ON Locations (Name);
CREATE INDEX IX_Locations_TypeID ON Locations (TypeID);

-- ====================
-- Users
-- ====================
CREATE INDEX IX_Users_Username ON Users (Username);
CREATE INDEX IX_Users_RoleID ON Users (RoleID);

-- ====================
-- Manifests
-- ====================
CREATE INDEX IX_Manifests_StatusID ON Manifests (StatusID);
CREATE INDEX IX_Manifests_ElectionID ON Manifests (ElectionID);
CREATE INDEX IX_Manifests_FromLocationID ON Manifests (FromLocationID);
CREATE INDEX IX_Manifests_ToLocationID ON Manifests (ToLocationID);

-- ====================
-- Manifest Items
-- ====================
CREATE INDEX IX_ManifestItems_ManifestID ON ManifestItems (ManifestID);
CREATE INDEX IX_ManifestItems_AssetID ON ManifestItems (AssetID);

-- ====================
-- Asset Status History
-- ====================
CREATE INDEX IX_AssetStatuses_AssetID ON AssetStatuses (AssetID);
CREATE INDEX IX_AssetStatuses_StatusID ON AssetStatuses (StatusID);
CREATE INDEX IX_AssetStatuses_DateTime ON AssetStatuses (DateTime);

-- ====================
-- Activities
-- ====================
CREATE INDEX IX_Activities_AssetID ON Activities (AssetID);
CREATE INDEX IX_Activities_ActivityCodeID ON Activities (ActivityCodeID);
CREATE INDEX IX_Activities_DateTime ON Activities (DateTime);

-- ====================
-- Chain of Custody Events
-- ====================
CREATE INDEX IX_CustodyEvents_AssetID ON ChainOfCustodyEvents (AssetID);
CREATE INDEX IX_CustodyEvents_DateTime ON ChainOfCustodyEvents (DateTime);

-- ====================
-- Audit Sessions
-- ====================
CREATE INDEX IX_AuditSessions_WarehouseLocationID ON AuditSessions (WarehouseLocationID);
CREATE INDEX IX_AuditSessions_AuditorID ON AuditSessions (AuditorID);

-- ====================
-- Audit Scan Records
-- ====================
CREATE INDEX IX_AuditScanRecords_SessionID ON AuditScanRecords (SessionID);
CREATE INDEX IX_AuditScanRecords_AssetID ON AuditScanRecords (AssetID);
CREATE INDEX IX_AuditScanRecords_ScanTime ON AuditScanRecords (ScanTime);

-- ====================
-- Discrepancy Records
-- ====================
CREATE INDEX IX_DiscrepancyRecords_SessionID ON DiscrepancyRecords (SessionID);
CREATE INDEX IX_DiscrepancyRecords_AssetID ON DiscrepancyRecords (AssetID);
CREATE INDEX IX_DiscrepancyRecords_IsResolved ON DiscrepancyRecords (IsResolved);

-- ====================
-- Maintenance Records
-- ====================
CREATE INDEX IX_MaintenanceRecords_AssetID ON MaintenanceRecords (AssetID);
CREATE INDEX IX_MaintenanceRecords_TechnicianID ON MaintenanceRecords (TechnicianID);
