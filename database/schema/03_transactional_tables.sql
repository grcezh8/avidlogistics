-- =============================================
-- Transactional / Linking Tables
-- =============================================

-- Manifests
CREATE TABLE Manifests (
    ManifestID INT IDENTITY(1,1) PRIMARY KEY,
    ElectionID INT NOT NULL,
    FromLocationID INT NOT NULL,
    ToLocationID INT NOT NULL,
    CreatedBy INT NOT NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    StatusID INT NOT NULL,
    DeliveredDate DATETIME2 NULL,
    Notes NVARCHAR(1000) NULL,
    FOREIGN KEY (ElectionID) REFERENCES Elections(ElectionID),
    FOREIGN KEY (FromLocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (ToLocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (StatusID) REFERENCES ManifestStatuses(ManifestStatusID)
);

-- Manifest Items
CREATE TABLE ManifestItems (
    ManifestItemID INT IDENTITY(1,1) PRIMARY KEY,
    ManifestID INT NOT NULL,
    AssetID INT NOT NULL,
    SealNumber NVARCHAR(50) NULL,
    AssignedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ManifestID) REFERENCES Manifests(ManifestID) ON DELETE CASCADE,
    FOREIGN KEY (AssetID) REFERENCES Assets(AssetID),
    FOREIGN KEY (SealNumber) REFERENCES Seals(SealNumber)
);
