-- =============================================
-- AVID Logistics Sample Data (Corrected Schema)
-- =============================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- Insert sample poll sites
INSERT INTO PollSites (SiteNumber, FacilityName, HouseNumber, StreetName, City, State, ZipCode, IsActive, CreatedDate, ModifiedDate)
VALUES 
    ('PS001', 'Community Center North', '123', 'Main Street', 'Springfield', 'IL', '62701', 1, GETDATE(), GETDATE()),
    ('PS002', 'Elementary School East', '456', 'Oak Avenue', 'Springfield', 'IL', '62702', 1, GETDATE(), GETDATE()),
    ('PS003', 'Fire Station West', '789', 'Pine Road', 'Springfield', 'IL', '62703', 1, GETDATE(), GETDATE()),
    ('PS004', 'Library Branch South', '321', 'Elm Street', 'Springfield', 'IL', '62704', 1, GETDATE(), GETDATE()),
    ('PS005', 'Recreation Center', '654', 'Maple Drive', 'Springfield', 'IL', '62705', 1, GETDATE(), GETDATE());

-- Insert sample assets with correct column names (Status: 0=Available, 1=Pending, 2=Unavailable)
-- (Condition: 0=New, 1=Good, 2=Fair, 3=Poor, 4=Retired)
INSERT INTO Assets (SerialNumber, AssetType, Barcode, RfidTag, Status, Condition, Location, RegisteredDate, CreatedDate, ModifiedDate, FacilityId, KitID)
VALUES 
    -- Voting Machines
    ('VM001-2024', 'Voting Machine', 'BC001VM', 'RF001VM', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('VM002-2024', 'Voting Machine', 'BC002VM', 'RF002VM', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('VM003-2024', 'Voting Machine', 'BC003VM', 'RF003VM', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('VM004-2024', 'Voting Machine', 'BC004VM', 'RF004VM', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('VM005-2024', 'Voting Machine', 'BC005VM', 'RF005VM', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    
    -- Ballot Scanners
    ('BS001-2024', 'Ballot Scanner', 'BC001BS', 'RF001BS', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BS002-2024', 'Ballot Scanner', 'BC002BS', 'RF002BS', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BS003-2024', 'Ballot Scanner', 'BC003BS', 'RF003BS', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BS004-2024', 'Ballot Scanner', 'BC004BS', 'RF004BS', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BS005-2024', 'Ballot Scanner', 'BC005BS', 'RF005BS', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    
    -- Ballot Boxes
    ('BB001-2024', 'Ballot Box', 'BC001BB', 'RF001BB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BB002-2024', 'Ballot Box', 'BC002BB', 'RF002BB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BB003-2024', 'Ballot Box', 'BC003BB', 'RF003BB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BB004-2024', 'Ballot Box', 'BC004BB', 'RF004BB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('BB005-2024', 'Ballot Box', 'BC005BB', 'RF005BB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    
    -- Privacy Booths
    ('PB001-2024', 'Privacy Booth', 'BC001PB', 'RF001PB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('PB002-2024', 'Privacy Booth', 'BC002PB', 'RF002PB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('PB003-2024', 'Privacy Booth', 'BC003PB', 'RF003PB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('PB004-2024', 'Privacy Booth', 'BC004PB', 'RF004PB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('PB005-2024', 'Privacy Booth', 'BC005PB', 'RF005PB', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    
    -- Accessible Equipment
    ('AE001-2024', 'Accessible Equipment', 'BC001AE', 'RF001AE', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('AE002-2024', 'Accessible Equipment', 'BC002AE', 'RF002AE', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL),
    ('AE003-2024', 'Accessible Equipment', 'BC003AE', 'RF003AE', 0, 0, 'Warehouse A', GETDATE(), GETDATE(), GETDATE(), 1, NULL);

PRINT 'Sample poll sites and assets inserted successfully!';
