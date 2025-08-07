-- =============================================
-- Sample Poll Sites Data
-- =============================================

-- Insert sample poll sites for testing the packing system
INSERT INTO PollSites (SiteNumber, FacilityName, City, State, ZipCode, IsActive, CreatedBy)
VALUES 
    ('001', 'Downtown Community Center', 'New York', 'NY', '10001', 1, 1),
    ('002', 'Riverside Elementary School', 'New York', 'NY', '10002', 1, 1),
    ('003', 'Central Library Branch', 'New York', 'NY', '10003', 1, 1),
    ('004', 'Westside Fire Station', 'New York', 'NY', '10004', 1, 1),
    ('005', 'Northside Community Hall', 'New York', 'NY', '10005', 1, 1),
    ('006', 'Eastside Recreation Center', 'New York', 'NY', '10006', 1, 1),
    ('007', 'Southside Senior Center', 'New York', 'NY', '10007', 1, 1),
    ('008', 'Midtown Public School', 'New York', 'NY', '10008', 1, 1),
    ('009', 'Harbor View Church', 'New York', 'NY', '10009', 1, 1),
    ('010', 'University Campus Center', 'New York', 'NY', '10010', 1, 1);

-- Insert sample asset types if they don't exist
IF NOT EXISTS (SELECT 1 FROM AssetTypes WHERE Name = 'Ballot Box')
BEGIN
    INSERT INTO AssetTypes (Name, Description, Category, IsActive)
    VALUES 
        ('Ballot Box', 'Secure container for collecting ballots', 'Voting Equipment', 1),
        ('Voting Booth', 'Private booth for voters to mark ballots', 'Voting Equipment', 1),
        ('Scanner', 'Electronic ballot scanning device', 'Technology', 1),
        ('Accessible Voting Device', 'Device for voters with disabilities', 'Accessibility', 1),
        ('Signage', 'Directional and informational signs', 'Supplies', 1),
        ('Supplies', 'General voting supplies and materials', 'Supplies', 1);
END

-- Insert sample assets if they don't exist
IF NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'BB-001')
BEGIN
    INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
    SELECT 
        'BB-001', 
        at.AssetTypeID, 
        asd.AssetStatusID, 
        'BC-BB001', 
        'New', 
        1, -- Assuming LocationID 1 exists
        GETUTCDATE(), 
        GETUTCDATE(), 
        GETUTCDATE()
    FROM AssetTypes at, AssetStatusDefinitions asd 
    WHERE at.Name = 'Ballot Box' AND asd.StatusCode = 1; -- Available status
END

IF NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'VB-001')
BEGIN
    INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
    SELECT 
        'VB-001', 
        at.AssetTypeID, 
        asd.AssetStatusID, 
        'BC-VB001', 
        'New', 
        1,
        GETUTCDATE(), 
        GETUTCDATE(), 
        GETUTCDATE()
    FROM AssetTypes at, AssetStatusDefinitions asd 
    WHERE at.Name = 'Voting Booth' AND asd.StatusCode = 1;
END

IF NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'SC-001')
BEGIN
    INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
    SELECT 
        'SC-001', 
        at.AssetTypeID, 
        asd.AssetStatusID, 
        'BC-SC001', 
        'New', 
        1,
        GETUTCDATE(), 
        GETUTCDATE(), 
        GETUTCDATE()
    FROM AssetTypes at, AssetStatusDefinitions asd 
    WHERE at.Name = 'Scanner' AND asd.StatusCode = 1;
END

-- Add more sample assets
INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
SELECT 
    'BB-002', 
    at.AssetTypeID, 
    asd.AssetStatusID, 
    'BC-BB002', 
    'New', 
    1,
    GETUTCDATE(), 
    GETUTCDATE(), 
    GETUTCDATE()
FROM AssetTypes at, AssetStatusDefinitions asd 
WHERE at.Name = 'Ballot Box' AND asd.StatusCode = 1
AND NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'BB-002');

INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
SELECT 
    'VB-002', 
    at.AssetTypeID, 
    asd.AssetStatusID, 
    'BC-VB002', 
    'New', 
    1,
    GETUTCDATE(), 
    GETUTCDATE(), 
    GETUTCDATE()
FROM AssetTypes at, AssetStatusDefinitions asd 
WHERE at.Name = 'Voting Booth' AND asd.StatusCode = 1
AND NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'VB-002');

INSERT INTO Assets (SerialNumber, AssetTypeID, StatusID, Barcode, Condition, LocationID, RegisteredDate, CreatedDate, ModifiedDate)
SELECT 
    'AVD-001', 
    at.AssetTypeID, 
    asd.AssetStatusID, 
    'BC-AVD001', 
    'New', 
    1,
    GETUTCDATE(), 
    GETUTCDATE(), 
    GETUTCDATE()
FROM AssetTypes at, AssetStatusDefinitions asd 
WHERE at.Name = 'Accessible Voting Device' AND asd.StatusCode = 1
AND NOT EXISTS (SELECT 1 FROM Assets WHERE SerialNumber = 'AVD-001');
