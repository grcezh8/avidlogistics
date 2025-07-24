-- =============================================
-- Stored Procedures - Write Operations
-- =============================================

-- Create a new asset
CREATE OR ALTER PROCEDURE sp_CreateAsset
    @SerialNumber NVARCHAR(100),
    @AssetTypeID INT,
    @Barcode NVARCHAR(50) = NULL,
    @RfidTag NVARCHAR(50) = NULL,
    @LocationID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO Assets (
            SerialNumber,
            AssetTypeID,
            StatusID,
            Barcode,
            RfidTag,
            LocationID,
            RegisteredDate
        )
        VALUES (
            @SerialNumber,
            @AssetTypeID,
            0, -- Unregistered status
            @Barcode,
            @RfidTag,
            @LocationID,
            GETUTCDATE()
        );

        SELECT SCOPE_IDENTITY() AS NewAssetID;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO

-- Update asset status and optionally location
CREATE OR ALTER PROCEDURE sp_UpdateAssetStatus
    @AssetID INT,
    @StatusID INT,
    @LocationID INT = NULL,
    @UserID INT,
    @ElectionID INT,
    @Notes NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE Assets
        SET StatusID = @StatusID,
            LocationID = @LocationID,
            ModifiedDate = GETUTCDATE()
        WHERE AssetID = @AssetID;

        -- Insert status history record
        INSERT INTO AssetStatuses (
            AssetID,
            ElectionID,
            StatusID,
            LocationID,
            DateTime,
            UserID,
            Notes
        )
        VALUES (
            @AssetID,
            @ElectionID,
            @StatusID,
            @LocationID,
            GETUTCDATE(),
            @UserID,
            @Notes
        );

        SELECT 'Success' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO

-- Create a new manifest
CREATE OR ALTER PROCEDURE sp_CreateManifest
    @ElectionID INT,
    @FromLocationID INT,
    @ToLocationID INT,
    @CreatedBy INT,
    @StatusID INT,
    @Notes NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO Manifests (
            ElectionID,
            FromLocationID,
            ToLocationID,
            CreatedBy,
            CreatedDate,
            StatusID,
            Notes
        )
        VALUES (
            @ElectionID,
            @FromLocationID,
            @ToLocationID,
            @CreatedBy,
            GETUTCDATE(),
            @StatusID,
            @Notes
        );

        SELECT SCOPE_IDENTITY() AS NewManifestID;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO

-- Add an asset to a manifest
CREATE OR ALTER PROCEDURE sp_AddAssetToManifest
    @ManifestID INT,
    @AssetID INT,
    @SealNumber NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO ManifestItems (
            ManifestID,
            AssetID,
            SealNumber,
            AssignedDate
        )
        VALUES (
            @ManifestID,
            @AssetID,
            @SealNumber,
            GETUTCDATE()
        );

        -- Optionally, auto-update asset status (e.g. to "In Transit")
        UPDATE Assets
        SET StatusID = 3 -- Assuming 3 = In Transit
        WHERE AssetID = @AssetID;

        SELECT 'Success' AS Message;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO
