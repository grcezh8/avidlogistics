-- Sample data for testing the Packing/Manifests functionality
-- This provides realistic test data without using mocks

-- Ensure we have basic reference data
IF NOT EXISTS (SELECT 1 FROM Elections WHERE ElectionId = 1)
BEGIN
    INSERT INTO Elections (ElectionId, Name, ElectionType, ElectionDate, IsActive) VALUES
    (1, '2024 General Election', 'General', '2024-11-05', 1);
END

IF NOT EXISTS (SELECT 1 FROM Facilities WHERE FacilityId = 1)
BEGIN
    INSERT INTO Facilities (FacilityId, Name, Address, ContactInfo, IsActive) VALUES
    (1, 'Main Warehouse', '123 Storage St, City, State 12345', 'warehouse@avidlogistics.com', 1);
END

IF NOT EXISTS (SELECT 1 FROM PollSites WHERE PollSiteId = 1)
BEGIN
    INSERT INTO PollSites (PollSiteId, SiteNumber, FacilityName, Address, ContactInfo, IsActive) VALUES
    (1, 'PS001', 'Community Center', '456 Voting Ave, City, State 12345', 'community@city.gov', 1),
    (2, 'PS002', 'Elementary School', '789 School Rd, City, State 12345', 'school@district.edu', 1);
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = 1)
BEGIN
    INSERT INTO Users (Id, Username, Email, FirstName, LastName, Role, IsActive) VALUES
    (1, 'warehouse_admin', 'admin@avidlogistics.com', 'John', 'Smith', 'Admin', 1),
    (2, 'packer_jane', 'jane@avidlogistics.com', 'Jane', 'Doe', 'WarehouseStaff', 1);
END

-- Sample Assets for manifest items
IF NOT EXISTS (SELECT 1 FROM Assets WHERE Id = 1)
BEGIN
    INSERT INTO Assets (Id, SerialNumber, AssetType, Barcode, Location, Status, Condition, RegisteredDate, FacilityId, CreatedDate) VALUES
    (1, 'BB001', 'Ballot Box', 'BB001-BARCODE', 'Main Warehouse', 1, 1, GETUTCDATE(), 1, GETUTCDATE()),
    (2, 'VM001', 'Voting Machine', 'VM001-BARCODE', 'Main Warehouse', 1, 1, GETUTCDATE(), 1, GETUTCDATE()),
    (3, 'PB001', 'Poll Book', 'PB001-BARCODE', 'Main Warehouse', 1, 1, GETUTCDATE(), 1, GETUTCDATE()),
    (4, 'BB002', 'Ballot Box', 'BB002-BARCODE', 'Main Warehouse', 1, 1, GETUTCDATE(), 1, GETUTCDATE()),
    (5, 'VM002', 'Voting Machine', 'VM002-BARCODE', 'Main Warehouse', 1, 1, GETUTCDATE(), 1, GETUTCDATE());
END

-- Sample Seals
IF NOT EXISTS (SELECT 1 FROM Seals WHERE SealId = 1)
BEGIN
    INSERT INTO Seals (SealId, SealNumber, Status, CreatedDate, IsActive) VALUES
    (1, 'SEAL001', 1, GETUTCDATE(), 1),
    (2, 'SEAL002', 1, GETUTCDATE(), 1),
    (3, 'SEAL003', 1, GETUTCDATE(), 1),
    (4, 'SEAL004', 1, GETUTCDATE(), 1),
    (5, 'SEAL005', 1, GETUTCDATE(), 1);
END

-- Sample Manifests in different states
-- Manifest 1: Ready for Packing (has items, ready to be packed)
IF NOT EXISTS (SELECT 1 FROM Manifests WHERE ManifestId = 1)
BEGIN
    INSERT INTO Manifests (ManifestId, ManifestNumber, ElectionId, FromFacilityId, ToPollSiteId, Status, CreatedBy, CreatedDate) VALUES
    (1, 'MAN-20240131-ABC12345', 1, 1, 1, 2, 1, GETUTCDATE()); -- Status 2 = ReadyForPacking
    
    -- Add items to this manifest
    INSERT INTO ManifestItems (ManifestId, AssetId, SealNumber, IsPacked, PackedBy, PackedDate) VALUES
    (1, 1, 'SEAL001', 0, NULL, NULL),
    (1, 2, 'SEAL002', 0, NULL, NULL),
    (1, 3, 'SEAL003', 0, NULL, NULL);
END

-- Manifest 2: Partially Packed (some items packed, some not)
IF NOT EXISTS (SELECT 1 FROM Manifests WHERE ManifestId = 2)
BEGIN
    INSERT INTO Manifests (ManifestId, ManifestNumber, ElectionId, FromFacilityId, ToPollSiteId, Status, CreatedBy, CreatedDate) VALUES
    (2, 'MAN-20240131-DEF67890', 1, 1, 2, 3, 1, GETUTCDATE()); -- Status 3 = PartiallyPacked
    
    -- Add items to this manifest (some packed, some not)
    INSERT INTO ManifestItems (ManifestId, AssetId, SealNumber, IsPacked, PackedBy, PackedDate) VALUES
    (2, 4, 'SEAL004', 1, 2, DATEADD(HOUR, -1, GETUTCDATE())), -- Packed 1 hour ago
    (2, 5, 'SEAL005', 0, NULL, NULL); -- Not packed yet
END

-- Manifest 3: Draft (for testing creation workflow)
IF NOT EXISTS (SELECT 1 FROM Manifests WHERE ManifestId = 3)
BEGIN
    INSERT INTO Manifests (ManifestId, ManifestNumber, ElectionId, FromFacilityId, ToPollSiteId, Status, CreatedBy, CreatedDate) VALUES
    (3, 'MAN-20240131-GHI11111', 1, 1, 1, 1, 1, GETUTCDATE()); -- Status 1 = Draft
    
    -- No items yet - this is a draft manifest
END
