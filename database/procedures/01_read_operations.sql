-- =============================================
-- Stored Procedures - Read Operations
-- =============================================

-- Get all assets by status
CREATE OR ALTER PROCEDURE sp_GetAssetsByStatus
    @StatusID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        a.AssetID,
        a.SerialNumber,
        a.Barcode,
        a.RfidTag,
        a.Condition,
        at.Name AS AssetType,
        s.Name AS StatusName,
        l.Name AS Location
    FROM Assets a
    INNER JOIN AssetTypes at ON a.AssetTypeID = at.AssetTypeID
    INNER JOIN AssetStatusDefinitions s ON a.StatusID = s.AssetStatusID
    LEFT JOIN Locations l ON a.LocationID = l.LocationID
    WHERE a.StatusID = @StatusID
    ORDER BY a.SerialNumber;
END;
GO

-- Get all available assets
CREATE OR ALTER PROCEDURE sp_GetAvailableAssets
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        a.AssetID,
        a.SerialNumber,
        a.Barcode,
        a.RfidTag,
        at.Name AS AssetType,
        l.Name AS Location
    FROM Assets a
    INNER JOIN AssetTypes at ON a.AssetTypeID = at.AssetTypeID
    LEFT JOIN Locations l ON a.LocationID = l.LocationID
    WHERE a.StatusID = 1 -- Available
    ORDER BY at.Name, a.SerialNumber;
END;
GO

-- Get manifest with all items
CREATE OR ALTER PROCEDURE sp_GetManifestWithItems
    @ManifestID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Manifest header
    SELECT
        m.ManifestID,
        e.Name AS ElectionName,
        f.Name AS FromLocation,
        t.Name AS ToLocation,
        m.StatusID,
        ms.StatusName,
        u.Name AS CreatedBy,
        m.CreatedDate,
        m.DeliveredDate,
        m.Notes
    FROM Manifests m
    INNER JOIN Elections e ON m.ElectionID = e.ElectionID
    INNER JOIN Locations f ON m.FromLocationID = f.LocationID
    INNER JOIN Locations t ON m.ToLocationID = t.LocationID
    INNER JOIN Users u ON m.CreatedBy = u.UserID
    INNER JOIN ManifestStatuses ms ON m.StatusID = ms.ManifestStatusID
    WHERE m.ManifestID = @ManifestID;

    -- Manifest items
    SELECT
        mi.ManifestItemID,
        mi.AssetID,
        a.SerialNumber,
        a.Barcode,
        at.Name AS AssetType,
        mi.SealNumber,
        mi.AssignedDate
    FROM ManifestItems mi
    INNER JOIN Assets a ON mi.AssetID = a.AssetID
    INNER JOIN AssetTypes at ON a.AssetTypeID = at.AssetTypeID
    WHERE mi.ManifestID = @ManifestID;
END;
GO

-- Get asset maintenance history
CREATE OR ALTER PROCEDURE sp_GetAssetMaintenanceHistory
    @AssetID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mr.MaintenanceRecordID,
        mr.Date,
        mr.WorkDescription,
        mr.PartsUsed,
        mr.Cost,
        u.Name AS TechnicianName
    FROM MaintenanceRecords mr
    INNER JOIN Users u ON mr.TechnicianID = u.UserID
    WHERE mr.AssetID = @AssetID
    ORDER BY mr.Date DESC;
END;
GO

-- Get active audit sessions
CREATE OR ALTER PROCEDURE sp_GetActiveAuditSessions
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        aus.AuditSessionID,
        l.Name AS WarehouseLocation,
        u.Name AS Auditor,
        aus.Status,
        aus.StartDate,
        aus.EndDate,
        aus.Notes
    FROM AuditSessions aus
    INNER JOIN Locations l ON aus.WarehouseLocationID = l.LocationID
    INNER JOIN Users u ON aus.AuditorID = u.UserID
    WHERE aus.Status IN ('Open', 'In Progress');
END;
GO

-- Get audit session details
CREATE OR ALTER PROCEDURE sp_GetAuditSessionWithRecords
    @SessionID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Session header
    SELECT
        aus.AuditSessionID,
        l.Name AS WarehouseLocation,
        u.Name AS Auditor,
        aus.Status,
        aus.StartDate,
        aus.EndDate,
        aus.Notes
    FROM AuditSessions aus
    INNER JOIN Locations l ON aus.WarehouseLocationID = l.LocationID
    INNER JOIN Users u ON aus.AuditorID = u.UserID
    WHERE aus.AuditSessionID = @SessionID;

    -- Scan records
    SELECT
        asr.AuditScanRecordID,
        asr.Barcode,
        a.SerialNumber,
        asr.ScanTime,
        loc.Name AS Location
    FROM AuditScanRecords asr
    LEFT JOIN Assets a ON asr.AssetID = a.AssetID
    LEFT JOIN Locations loc ON asr.LocationID = loc.LocationID
    WHERE asr.SessionID = @SessionID;

    -- Discrepancy records
    SELECT
        dr.DiscrepancyID,
        a.SerialNumber,
        el.Name AS ExpectedLocation,
        al.Name AS ActualLocation,
        dr.IsResolved,
        dr.Resolution,
        dr.CreatedDate,
        dr.ResolvedDate
    FROM DiscrepancyRecords dr
    INNER JOIN Assets a ON dr.AssetID = a.AssetID
    INNER JOIN Locations el ON dr.ExpectedLocationID = el.LocationID
    INNER JOIN Locations al ON dr.ActualLocationID = al.LocationID
    WHERE dr.SessionID = @SessionID;
END;
GO
