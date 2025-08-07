-- SQL script to insert a test asset directly into the database
-- This bypasses the API to test if the frontend can display data from the database

USE AVIDLogistics;

-- Insert a test asset
INSERT INTO Assets (
    SerialNumber,
    AssetType,
    Barcode,
    RfidTag,
    Status,
    Condition,
    FacilityId,
    CreatedAt,
    UpdatedAt
) VALUES (
    'TEST-ASSET-001',
    'VotingMachine',
    'BAR-TEST-001',
    'RFID-TEST-001',
    1, -- Available status
    0, -- Good condition
    1, -- Facility ID 1
    GETDATE(),
    GETDATE()
);

-- Insert another test asset
INSERT INTO Assets (
    SerialNumber,
    AssetType,
    Barcode,
    RfidTag,
    Status,
    Condition,
    FacilityId,
    CreatedAt,
    UpdatedAt
) VALUES (
    'TEST-ASSET-002',
    'BallotBox',
    'BAR-TEST-002',
    'RFID-TEST-002',
    2, -- Assigned status
    0, -- Good condition
    1, -- Facility ID 1
    GETDATE(),
    GETDATE()
);

-- Verify the inserts
SELECT * FROM Assets WHERE SerialNumber LIKE 'TEST-ASSET-%';