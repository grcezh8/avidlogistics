-- =============================================
-- Audit / Custody / Compliance Tables
-- =============================================

-- Asset Status History (tracks all status changes)
CREATE TABLE AssetStatuses (
    AssetStatusID INT IDENTITY(1,1) PRIMARY KEY,
    AssetID INT NOT NULL,
    ElectionID INT NOT NULL,
    StatusID INT NOT NULL,
    LocationID INT NULL,
    DateTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UserID INT NOT NULL,
    Notes NVARCHAR(1000) NULL,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    FOREIGN KEY (StatusID) REFERENCES AssetStatusDefinitions(AssetStatusID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- General Activities (log events for audit)
CREATE TABLE Activities (
    ActivityID INT IDENTITY(1,1) PRIMARY KEY,
    AssetID INT NOT NULL,
    ElectionID INT NOT NULL,
    ActivityCodeID INT NOT NULL,
    DateTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UserID INT NOT NULL,
    Notes NVARCHAR(1000) NULL,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    FOREIGN KEY (ActivityCodeID) REFERENCES ActivityCodes(ActivityCodeID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Chain-of-Custody Events (legal handoffs)
CREATE TABLE ChainOfCustodyEvents (
    EventID INT IDENTITY(1,1) PRIMARY KEY,
    ElectionID INT NOT NULL,
    AssetID INT NOT NULL,
    FromParty NVARCHAR(200) NOT NULL,
    ToParty NVARCHAR(200) NOT NULL,
    DateTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SealNumber NVARCHAR(50) NULL,
    Notes NVARCHAR(1000) NULL,
    ScannedFormID INT NULL,
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (SealNumber) REFERENCES Seals(SealNumber)
);

-- Scanned Forms (images of chain-of-custody documents)
CREATE TABLE ScannedForms (
    ScannedFormID INT IDENTITY(1,1) PRIMARY KEY,
    ElectionID INT NOT NULL,
    EventID INT NULL,
    ImageURL NVARCHAR(500) NOT NULL,
    UploadedBy INT NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FormType NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    FOREIGN KEY (EventID) REFERENCES ChainOfCustodyEvents(EventID),
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
);

-- FK linking ScannedForms to ChainOfCustodyEvents
ALTER TABLE ChainOfCustodyEvents
ADD FOREIGN KEY (ScannedFormID) REFERENCES ScannedForms(ScannedFormID);

-- Audit Sessions (warehouse audits)
CREATE TABLE AuditSessions (
    AuditSessionID INT IDENTITY(1,1) PRIMARY KEY,
    ElectionID INT NULL,
    WarehouseLocationID INT NOT NULL,
    AuditorID INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    StartDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    EndDate DATETIME2 NULL,
    Notes NVARCHAR(1000) NULL,
    FOREIGN KEY (WarehouseLocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (AuditorID) REFERENCES Users(UserID),
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID)
);

-- Audit Scan Records (each barcode scan)
CREATE TABLE AuditScanRecords (
    AuditScanRecordID INT IDENTITY(1,1) PRIMARY KEY,
    SessionID INT NOT NULL,
    AssetID INT NULL,
    Barcode NVARCHAR(50) NOT NULL,
    LocationID INT NOT NULL,
    ScanTime DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (SessionID) REFERENCES AuditSessions(AuditSessionID) ON DELETE CASCADE,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID)
);

-- Discrepancy Records (audit errors)
CREATE TABLE DiscrepancyRecords (
    DiscrepancyID INT IDENTITY(1,1) PRIMARY KEY,
    SessionID INT NOT NULL,
    AssetID INT NOT NULL,
    ExpectedLocationID INT NOT NULL,
    ActualLocationID INT NOT NULL,
    Notes NVARCHAR(500) NULL,
    IsResolved BIT NOT NULL DEFAULT 0,
    Resolution NVARCHAR(500) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ResolvedDate DATETIME2 NULL,
    FOREIGN KEY (SessionID) REFERENCES AuditSessions(AuditSessionID) ON DELETE CASCADE,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (ExpectedLocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (ActualLocationID) REFERENCES Locations(LocationID)
);

-- Maintenance Records (lifecycle management)
CREATE TABLE MaintenanceRecords (
    MaintenanceRecordID INT IDENTITY(1,1) PRIMARY KEY,
    AssetID INT NOT NULL,
    Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    TechnicianID INT NOT NULL,
    WorkDescription NVARCHAR(500) NOT NULL,
    PartsUsed NVARCHAR(500) NULL,
    Cost DECIMAL(10,2) NULL,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (TechnicianID) REFERENCES Users(UserID)
);
