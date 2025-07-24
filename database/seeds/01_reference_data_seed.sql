-- =============================================
-- Seed Data - Reference / Lookup Tables
-- Production-safe only. No demo users.
-- =============================================

-- Activity Codes
INSERT INTO ActivityCodes (Code, Description) VALUES
('CHECKIN', 'Asset checked in'),
('CHECKOUT', 'Asset checked out'),
('TRANSFER', 'Asset transferred between locations'),
('MAINTENANCE', 'Asset sent for maintenance'),
('AUDIT', 'Asset included in warehouse audit');

-- Asset Types
INSERT INTO AssetTypes (Name, Description, Category) VALUES
('Ballot Box', 'Secure ballot collection container', 'Voting Equipment'),
('Voting Machine', 'Electronic voting equipment', 'Voting Equipment'),
('Poll Book', 'Electronic poll book', 'Check-in Equipment'),
('Seal', 'Tamper-evident seal', 'Security'),
('Backup Battery', 'Emergency power supply', 'Supplies');

-- Asset Status Definitions
INSERT INTO AssetStatusDefinitions (StatusCode, Name, DisplayName, Description, Color) VALUES
(0, 'Unregistered', 'Unregistered', 'Not yet registered in inventory', '#808080'),
(1, 'Available', 'Available', 'Ready for assignment or deployment', '#28a745'),
(2, 'Assigned', 'Assigned', 'Assigned to a manifest', '#007bff'),
(3, 'In Transit', 'In Transit', 'Being transported to destination', '#17a2b8'),
(4, 'Deployed', 'Deployed', 'In use at poll site', '#ffc107'),
(5, 'In Maintenance', 'In Maintenance', 'Undergoing repair or maintenance', '#fd7e14'),
(6, 'Out of Service', 'Out of Service', 'Retired or unusable', '#dc3545');

-- Location Types
INSERT INTO LocationTypes (TypeName) VALUES
('Warehouse'),
('PollSite'),
('MobileUnit');

-- Manifest Statuses
INSERT INTO ManifestStatuses (StatusName) VALUES
('Created'),
('In Transit'),
('Delivered');

-- Seal Statuses
INSERT INTO SealStatuses (StatusName) VALUES
('Available'),
('Applied'),
('Broken');

-- User Roles (RBAC)
INSERT INTO UserRoles (Name, DisplayName, Description) VALUES
('admin', 'System Administrator', 'Full system access'),
('warehouse_staff', 'Warehouse Staff', 'Can manage inventory and manifests'),
('logistics_coordinator', 'Logistics Coordinator', 'Manages manifests and deliveries'),
('auditor', 'Auditor', 'Can perform warehouse audits'),
('technician', 'Technician', 'Performs asset maintenance');
