# Database Schema Fixes for Asset "Unknown" Issue

## Problem Summary

The AVID Logistics application was experiencing issues where assets were showing as "Unknown" in the manifest packing interface. This was caused by several database schema inconsistencies and data integrity issues.

## Root Causes Identified

1. **Primary Key Mapping Mismatch**: The database schema used `AssetID` as the primary key column name, but Entity Framework was configured to map to `Id`.

2. **Status Enum Mismatch**: The frontend status mapping didn't match the backend `AssetStatus` enum values, particularly missing the `Packed` status.

3. **Orphaned ManifestItems**: Some ManifestItems referenced non-existent Assets, causing the "Unknown" display.

4. **Missing Foreign Key Constraints**: No referential integrity constraints prevented orphaned records.

5. **Inadequate Error Handling**: The ManifestService didn't provide detailed logging when assets couldn't be found.

## Fixes Applied

### 1. Database Schema Alignment

**Files Modified:**
- `database/migrations/010_fix_asset_primary_key_mapping.sql`
- `database/migrations/align_asset_schema_with_entity.sql`
- `database/migrations/fix_asset_constraints.sql`

**Changes:**
- Ensured Assets table uses `Id` as primary key column name
- Updated all foreign key references to use `AssetId` -> `Assets(Id)`
- Fixed unique constraints on nullable columns (Barcode, RfidTag)
- Aligned column lengths and data types with Entity Framework model

### 2. Entity Framework Configuration

**File Modified:** `backend/AVIDLogistics.Infrastructure/Data/WarehouseDbContext.cs`

**Changes:**
- Explicitly mapped Asset.Id to database `Id` column
- Updated column length constraints to match database schema
- Fixed filtered unique indexes for nullable columns

### 3. Frontend Status Mapping

**File Modified:** `frontend/src/features/inventory/InventoryPage.js`

**Changes:**
- Updated status enum mapping to include all 8 status values (0-7)
- Added `Packed` status (value 3) with purple color coding
- Fixed filter dropdown to include all status options

### 4. Data Integrity Cleanup

**File Created:** `database/migrations/011_cleanup_orphaned_manifest_items.sql`

**Changes:**
- Identified and removed orphaned ManifestItems
- Added foreign key constraints to prevent future orphaned records
- Implemented CASCADE delete for data consistency

### 5. Enhanced Error Handling

**File Modified:** `backend/AVIDLogistics.Application/Services/ManifestService.cs`

**Changes:**
- Added detailed logging for missing assets
- Improved error messages to show specific Asset IDs
- Enhanced debugging information for data integrity issues

## Asset Status Enum Mapping

| Value | Backend Enum | Frontend Display | Color |
|-------|-------------|------------------|-------|
| 0 | Unregistered | Unregistered | Gray |
| 1 | Available | Available | Green |
| 2 | Assigned | Assigned | Blue |
| 3 | Packed | Packed | Purple |
| 4 | InTransit | In Transit | Cyan |
| 5 | Deployed | Deployed | Yellow |
| 6 | InMaintenance | In Maintenance | Orange |
| 7 | OutOfService | Out of Service | Red |

## Database Schema Changes

### Assets Table Structure (After Fixes)
```sql
CREATE TABLE Assets (
    Id int IDENTITY(1,1) PRIMARY KEY,
    SerialNumber nvarchar(100) NOT NULL UNIQUE,
    AssetType nvarchar(100) NOT NULL,
    Barcode nvarchar(50) NULL,
    RfidTag nvarchar(50) NULL,
    Status int NOT NULL,
    Condition int NOT NULL,
    Location nvarchar(200) NULL,
    FacilityId int NULL,
    RegisteredDate datetime2 NOT NULL,
    CreatedDate datetime2 NOT NULL,
    ModifiedDate datetime2 NOT NULL
);
```

### Foreign Key Constraints Added
```sql
ALTER TABLE ManifestItems 
ADD CONSTRAINT FK_ManifestItems_Assets 
FOREIGN KEY (AssetId) REFERENCES Assets(Id) ON DELETE CASCADE;
```

## How to Apply Fixes

### Option 1: Automated Script (Recommended)
```powershell
.\apply-database-fixes.ps1
```

### Option 2: Manual Application
1. Run database migrations in order:
   ```sql
   -- From database directory
   sqlcmd -S localhost -d AVIDLogistics -E -i "migrations\010_fix_asset_primary_key_mapping.sql"
   sqlcmd -S localhost -d AVIDLogistics -E -i "migrations\align_asset_schema_with_entity.sql"
   sqlcmd -S localhost -d AVIDLogistics -E -i "migrations\fix_asset_constraints.sql"
   sqlcmd -S localhost -d AVIDLogistics -E -i "migrations\011_cleanup_orphaned_manifest_items.sql"
   ```

2. Rebuild and restart backend:
   ```bash
   cd backend
   dotnet build
   dotnet run
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm start
   ```

## Verification Steps

After applying fixes, verify the following:

1. **Assets Display Correctly**: Check that assets in manifests show proper serial numbers and types instead of "Unknown"

2. **Status Synchronization**: Verify that asset status changes in packing are reflected in inventory

3. **Data Integrity**: Confirm no orphaned ManifestItems exist:
   ```sql
   SELECT COUNT(*) AS OrphanedItems
   FROM ManifestItems mi
   LEFT JOIN Assets a ON mi.AssetId = a.Id
   WHERE a.Id IS NULL;
   -- Should return 0
   ```

4. **Foreign Key Constraints**: Verify constraints are in place:
   ```sql
   SELECT name FROM sys.foreign_keys 
   WHERE parent_object_id = OBJECT_ID('ManifestItems');
   ```

5. **Status Distribution**: Check asset status distribution:
   ```sql
   SELECT Status, COUNT(*) as Count,
   CASE Status
       WHEN 0 THEN 'Unregistered'
       WHEN 1 THEN 'Available'
       WHEN 2 THEN 'Assigned'
       WHEN 3 THEN 'Packed'
       WHEN 4 THEN 'InTransit'
       WHEN 5 THEN 'Deployed'
       WHEN 6 THEN 'InMaintenance'
       WHEN 7 THEN 'OutOfService'
   END AS StatusName
   FROM Assets GROUP BY Status ORDER BY Status;
   ```

## Expected Results

After applying these fixes:

- ✅ Assets will display proper serial numbers and types in manifest packing
- ✅ Asset status changes in packing will be reflected in inventory
- ✅ No more "Unknown" assets in manifest details
- ✅ Proper status color coding in inventory page
- ✅ Data integrity maintained with foreign key constraints
- ✅ Enhanced error logging for troubleshooting

## Rollback Plan

If issues occur, you can rollback by:

1. Restoring database from backup (if available)
2. Reverting Entity Framework configuration changes
3. Reverting frontend status mapping changes

## Files Modified Summary

### Database Files
- `database/migrations/010_fix_asset_primary_key_mapping.sql` (NEW)
- `database/migrations/011_cleanup_orphaned_manifest_items.sql` (NEW)
- `database/run_database_fixes.sql` (NEW)

### Backend Files
- `backend/AVIDLogistics.Infrastructure/Data/WarehouseDbContext.cs` (MODIFIED)
- `backend/AVIDLogistics.Application/Services/ManifestService.cs` (MODIFIED)

### Frontend Files
- `frontend/src/features/inventory/InventoryPage.js` (MODIFIED)

### Utility Files
- `apply-database-fixes.ps1` (NEW)
- `DATABASE_SCHEMA_FIXES.md` (NEW)

## Support

If you encounter issues after applying these fixes:

1. Check the console output for detailed error messages
2. Verify database connection and permissions
3. Ensure all migrations completed successfully
4. Check application logs for Entity Framework errors
5. Verify frontend console for any API call failures

The enhanced logging in ManifestService will now provide detailed information about any remaining data integrity issues.
