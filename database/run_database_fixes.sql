-- =============================================
-- Run All Database Schema Fixes
-- Execute all migrations to fix asset schema issues
-- =============================================

USE AVIDLogistics;
GO

PRINT '========================================';
PRINT 'Starting comprehensive database fixes...';
PRINT '========================================';

-- Step 1: Fix Asset Primary Key Mapping
PRINT '';
PRINT 'Step 1: Fixing Asset Primary Key Mapping...';
PRINT '-------------------------------------------';

-- Execute the primary key mapping fix
:r "010_fix_asset_primary_key_mapping.sql"

-- Step 2: Align Asset Schema with Entity
PRINT '';
PRINT 'Step 2: Aligning Asset Schema with Entity...';
PRINT '---------------------------------------------';

-- Execute the schema alignment
:r "align_asset_schema_with_entity.sql"

-- Step 3: Fix Asset Constraints
PRINT '';
PRINT 'Step 3: Fixing Asset Constraints...';
PRINT '-----------------------------------';

-- Execute the constraint fixes
:r "fix_asset_constraints.sql"

-- Step 4: Clean Up Orphaned ManifestItems
PRINT '';
PRINT 'Step 4: Cleaning Up Orphaned ManifestItems...';
PRINT '----------------------------------------------';

-- Execute the orphaned items cleanup
:r "011_cleanup_orphaned_manifest_items.sql"

-- Step 5: Final Verification
PRINT '';
PRINT 'Step 5: Final Database Verification...';
PRINT '--------------------------------------';

-- Verify Assets table structure
PRINT 'Assets table structure:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Assets'
ORDER BY ORDINAL_POSITION;

-- Verify foreign key constraints
PRINT '';
PRINT 'Foreign key constraints on ManifestItems:';
SELECT 
    fk.name AS constraint_name,
    OBJECT_NAME(fk.parent_object_id) AS table_name,
    c1.name AS column_name,
    OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
    c2.name AS referenced_column
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
JOIN sys.columns c1 ON fkc.parent_object_id = c1.object_id AND fkc.parent_column_id = c1.column_id
JOIN sys.columns c2 ON fkc.referenced_object_id = c2.object_id AND fkc.referenced_column_id = c2.column_id
WHERE fk.parent_object_id = OBJECT_ID('ManifestItems');

-- Verify data integrity
PRINT '';
PRINT 'Data integrity check:';
SELECT 
    'Assets' AS TableName,
    COUNT(*) AS RecordCount
FROM Assets
UNION ALL
SELECT 
    'ManifestItems' AS TableName,
    COUNT(*) AS RecordCount
FROM ManifestItems
UNION ALL
SELECT 
    'Manifests' AS TableName,
    COUNT(*) AS RecordCount
FROM Manifests;

-- Check for any remaining orphaned records
PRINT '';
PRINT 'Orphaned records check:';
SELECT 
    COUNT(*) AS OrphanedManifestItems
FROM ManifestItems mi
LEFT JOIN Assets a ON mi.AssetId = a.Id
WHERE a.Id IS NULL;

-- Check asset status distribution
PRINT '';
PRINT 'Asset status distribution:';
SELECT 
    Status,
    COUNT(*) AS Count,
    CASE Status
        WHEN 0 THEN 'Unregistered'
        WHEN 1 THEN 'Available'
        WHEN 2 THEN 'Assigned'
        WHEN 3 THEN 'Packed'
        WHEN 4 THEN 'InTransit'
        WHEN 5 THEN 'Deployed'
        WHEN 6 THEN 'InMaintenance'
        WHEN 7 THEN 'OutOfService'
        ELSE 'Unknown'
    END AS StatusName
FROM Assets
GROUP BY Status
ORDER BY Status;

PRINT '';
PRINT '========================================';
PRINT 'Database fixes completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Summary of changes:';
PRINT '- Fixed Asset primary key mapping (AssetID -> Id)';
PRINT '- Aligned Asset schema with Entity Framework model';
PRINT '- Fixed unique constraints on nullable columns';
PRINT '- Cleaned up orphaned ManifestItems';
PRINT '- Added foreign key constraints for data integrity';
PRINT '- Verified all data relationships';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Restart the backend application';
PRINT '2. Test asset creation and manifest operations';
PRINT '3. Verify that assets no longer show as "Unknown"';
PRINT '4. Check that inventory and packing pages are synchronized';
