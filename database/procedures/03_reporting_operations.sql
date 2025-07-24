-- =============================================
-- Stored Procedures - Reporting / Dashboard Operations
-- =============================================

-- Get warehouse dashboard summary stats
CREATE OR ALTER PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    -- Asset statistics
    SELECT 
        COUNT(*) AS TotalAssets,
        COUNT(CASE WHEN StatusID = 1 THEN 1 END) AS AvailableAssets,
        COUNT(CASE WHEN StatusID = 2 THEN 1 END) AS AssignedAssets,
        COUNT(CASE WHEN StatusID = 3 THEN 1 END) AS InTransitAssets,
        COUNT(CASE WHEN StatusID = 4 THEN 1 END) AS DeployedAssets,
        COUNT(CASE WHEN StatusID = 5 THEN 1 END) AS InMaintenanceAssets,
        COUNT(CASE WHEN StatusID = 6 THEN 1 END) AS OutOfServiceAssets
    FROM Assets;

    -- Manifest statistics
    SELECT 
        COUNT(*) AS TotalManifests,
        COUNT(CASE WHEN StatusID = 0 THEN 1 END) AS CreatedManifests,
        COUNT(CASE WHEN StatusID = 1 THEN 1 END) AS InTransitManifests,
        COUNT(CASE WHEN StatusID = 2 THEN 1 END) AS DeliveredManifests
    FROM Manifests;

    -- Recent activity (last 7 days)
    SELECT TOP 10
        'Asset' AS ActivityType,
        a.SerialNumber AS ItemName,
        a.ModifiedDate AS ActivityDate
    FROM Assets a
    WHERE a.ModifiedDate >= DATEADD(day, -7, GETUTCDATE())
    ORDER BY a.ModifiedDate DESC;
END;
GO

-- Get recent asset activity log
CREATE OR ALTER PROCEDURE sp_GetRecentAssetActivities
    @DaysBack INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ashis.AssetStatusID,
        a.SerialNumber,
        s.Name AS NewStatus,
        l.Name AS Location,
        u.Name AS UpdatedBy,
        ashis.DateTime,
        ashis.Notes
    FROM AssetStatuses ashis
    INNER JOIN Assets a ON ashis.AssetID = a.AssetID
    INNER JOIN AssetStatusDefinitions s ON ashis.StatusID = s.AssetStatusID
    LEFT JOIN Locations l ON ashis.LocationID = l.LocationID
    INNER JOIN Users u ON ashis.UserID = u.UserID
    WHERE ashis.DateTime >= DATEADD(day, -@DaysBack, GETUTCDATE())
    ORDER BY ashis.DateTime DESC;
END;
GO
