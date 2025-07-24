-- =============================================
-- Core Domain Entities
-- =============================================

-- Elections (for context/scoping)
CREATE TABLE Elections (
    ElectionID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    Notes NVARCHAR(1000) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NULL,
    Phone NVARCHAR(20) NULL,
    RoleID INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastLoginDate DATETIME2 NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (RoleID) REFERENCES UserRoles(UserRoleID)
);

-- Locations
CREATE TABLE Locations (
    LocationID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    TypeID INT NOT NULL,
    Address NVARCHAR(500) NULL,
    City NVARCHAR(100) NULL,
    State NVARCHAR(50) NULL,
    ZipCode NVARCHAR(10) NULL,
    ContactPerson NVARCHAR(100) NULL,
    ContactPhone NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TypeID) REFERENCES LocationTypes(LocationTypeID)
);

-- Assets
CREATE TABLE Assets (
    AssetID INT IDENTITY(1,1) PRIMARY KEY,
    SerialNumber NVARCHAR(100) NOT NULL UNIQUE,
    AssetTypeID INT NOT NULL,
    StatusID INT NOT NULL,
    Barcode NVARCHAR(50) NULL UNIQUE,
    RfidTag NVARCHAR(50) NULL UNIQUE,
    Condition NVARCHAR(50) NULL,
    LocationID INT NULL,
    Notes NVARCHAR(1000) NULL,
    RegisteredDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (AssetTypeID) REFERENCES AssetTypes(AssetTypeID),
    FOREIGN KEY (StatusID) REFERENCES AssetStatusDefinitions(AssetStatusID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

-- Seals
CREATE TABLE Seals (
    SealNumber NVARCHAR(50) PRIMARY KEY,
    StatusID INT NOT NULL,
    AppliedToAssetID INT NULL,
    ElectionID INT NULL,
    AppliedDate DATETIME2 NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (StatusID) REFERENCES SealStatuses(SealStatusID),
    FOREIGN KEY (AppliedToAssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID)
);
