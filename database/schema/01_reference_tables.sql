-- =============================================
-- Reference / Lookup Tables
-- For use in AVID Logistics system
-- Authoritative single source of valid values
-- =============================================

-- Activity Codes (Event types)
CREATE TABLE ActivityCodes (
    ActivityCodeID INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Description NVARCHAR(200) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Asset Types (normalize free-text Type field in Assets)
CREATE TABLE AssetTypes (
    AssetTypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Asset Status Definitions (normalize Status in Assets)
CREATE TABLE AssetStatusDefinitions (
    AssetStatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode INT NOT NULL UNIQUE,
    Name NVARCHAR(50) NOT NULL,
    DisplayName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Color NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Location Types (Warehouse, PollSite, Mobile Unit)
CREATE TABLE LocationTypes (
    LocationTypeID INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(50) NOT NULL UNIQUE
);

-- Manifest Statuses (for tracking delivery process)
CREATE TABLE ManifestStatuses (
    ManifestStatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);

-- Seal Statuses (Available, Applied, Broken)
CREATE TABLE SealStatuses (
    SealStatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);

-- User Roles (RBAC)
CREATE TABLE UserRoles (
    UserRoleID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Navigation Items (for role-based menus)
CREATE TABLE NavigationItems (
    NavigationItemID INT IDENTITY(1,1) PRIMARY KEY,
    RoleID INT NOT NULL,
    ItemKey NVARCHAR(50) NOT NULL,
    Label NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (RoleID) REFERENCES UserRoles(UserRoleID) ON DELETE CASCADE
);
