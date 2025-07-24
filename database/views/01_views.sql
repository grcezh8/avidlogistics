-- =============================================
-- Views for AVID Logistics Database
-- =============================================

-- =============================================
-- User Authentication View
-- Returns enriched user information for login
-- =============================================
CREATE OR ALTER VIEW vw_UserAuthentication AS
SELECT
    u.UserID,
    u.Username,
    u.PasswordHash,
    u.Name,
    u.Email,
    u.Phone,
    u.IsActive,
    u.LastLoginDate,
    r.UserRoleID,
    r.Name AS RoleName,
    r.DisplayName AS RoleDisplayName
FROM Users u
INNER JOIN UserRoles r ON u.RoleID = r.UserRoleID;

-- =============================================
-- Asset Details View
-- Enriched asset data for frontend display
-- =============================================
CREATE OR ALTER VIEW vw_AssetDetails AS
SELECT
    a.AssetID,
    a.SerialNumber,
    a.Barcode,
    a.RfidTag,
    at.Name AS AssetType,
    at.Category AS AssetCategory,
    s.Name AS StatusName,
    s.DisplayName AS StatusDisplayName,
    s.Color AS StatusColor,
    l.Name AS CurrentLocation,
    l.Address AS LocationAddress,
    l.City,
    l.State,
    l.ZipCode,
    a.Condition,
    a.RegisteredDate,
    a.CreatedDate,
    a.ModifiedDate
FROM Assets a
INNER JOIN AssetTypes at ON a.AssetTypeID = at.AssetTypeID
INNER JOIN AssetStatusDefinitions s ON a.StatusID = s.AssetStatusID
LEFT JOIN Locations l ON a.LocationID = l.LocationID;
