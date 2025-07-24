-- =============================================
-- AVID Logistics Master Schema
-- Authoritative build script
-- Executes all schema, indexes, views, procedures, and seeds in order
-- =============================================

-- USE the target database
USE AVIDLogistics;
GO

PRINT '========================================';
PRINT 'Starting AVID Logistics Master Schema Build';
PRINT '========================================';

-- ============================
-- 1️⃣ Reference / Lookup Tables
-- ============================
:r .\schema\01_reference_tables.sql

-- ============================
-- 2️⃣ Core Entities
-- ============================
:r .\schema\02_core_entities.sql

-- ============================
-- 3️⃣ Transactional / Linking Tables
-- ============================
:r .\schema\03_transactional_tables.sql

-- ============================
-- 4️⃣ Audit and Custody Tables
-- ============================
:r .\schema\04_audit_and_custody.sql

-- ============================
-- 5️⃣ Optional Fleet Tables
-- ============================
:r .\schema\05_optional_fleet.sql

-- ============================
-- Indexes
-- ============================
:r .\indexes\01_indexes.sql

-- ============================
-- Views
-- ============================
:r .\views\01_views.sql

-- ============================
-- Stored Procedures - Read
-- ============================
:r .\procedures\01_read_operations.sql

-- ============================
-- Stored Procedures - Write
-- ============================
:r .\procedures\02_write_operations.sql

-- ============================
-- Stored Procedures - Reporting
-- ============================
:r .\procedures\03_reporting_operations.sql

-- ============================
-- Seeds - Production-Safe Reference Data
-- ============================
:r .\seeds\01_reference_data_seed.sql

-- ============================
-- Seeds - DEMO ONLY (optional)
-- ============================
-- ⚠️ Uncomment only for dev/staging environments
-- :r .\seeds\02_demo_users_seed.sql

PRINT '========================================';
PRINT 'AVID Logistics Master Schema Build Completed Successfully';
PRINT '========================================';
