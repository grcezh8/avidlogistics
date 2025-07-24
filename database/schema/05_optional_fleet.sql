-- =============================================
-- Optional Fleet Management Tables
-- =============================================

-- Trucks (fleet vehicles)
CREATE TABLE Trucks (
    TruckID INT IDENTITY(1,1) PRIMARY KEY,
    LicensePlate NVARCHAR(20) NOT NULL UNIQUE,
    Make NVARCHAR(50) NULL,
    Model NVARCHAR(50) NULL,
    Year INT NULL,
    Capacity DECIMAL(10,2) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Drivers (personnel authorized to operate fleet)
CREATE TABLE Drivers (
    DriverID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    LicenseNumber NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NULL,
    Phone NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
