-- =============================================
-- Seed Data - DEMO / DEV ONLY
-- NOT FOR PRODUCTION DEPLOYMENTS
-- =============================================

-- =============================================
-- Demo Users
-- Passwords should be changed or disabled before production
-- =============================================

INSERT INTO Users (Username, PasswordHash, Name, Email, Phone, RoleID, IsActive)
VALUES
('admin', 'demo', 'Admin User', 'admin@example.com', '555-1000', 
    (SELECT UserRoleID FROM UserRoles WHERE Name = 'admin'), 1),

('warehouse1', 'demo', 'Warehouse Staff', 'warehouse1@example.com', '555-1001', 
    (SELECT UserRoleID FROM UserRoles WHERE Name = 'warehouse_staff'), 1),

('coordinator1', 'demo', 'Logistics Coordinator', 'coord1@example.com', '555-1002', 
    (SELECT UserRoleID FROM UserRoles WHERE Name = 'logistics_coordinator'), 1),

('auditor1', 'demo', 'Auditor User', 'auditor1@example.com', '555-1003', 
    (SELECT UserRoleID FROM UserRoles WHERE Name = 'auditor'), 1),

('tech1', 'demo', 'Technician User', 'tech1@example.com', '555-1004', 
    (SELECT UserRoleID FROM UserRoles WHERE Name = 'technician'), 1);

-- =============================================
-- Demo Navigation Items
-- Example menus for frontend by role
-- =============================================

-- Admin
INSERT INTO NavigationItems (RoleID, ItemKey, Label, Icon, SortOrder)
SELECT UserRoleID, 'dashboard', 'Dashboard', 'home', 1 FROM UserRoles WHERE Name = 'admin';

-- Warehouse Staff
INSERT INTO NavigationItems (RoleID, ItemKey, Label, Icon, SortOrder)
SELECT UserRoleID, 'inventory', 'Inventory', 'box', 1 FROM UserRoles WHERE Name = 'warehouse_staff'
UNION ALL
SELECT UserRoleID, 'manifests', 'Manifests', 'truck', 2 FROM UserRoles WHERE Name = 'warehouse_staff';

-- Logistics Coordinator
INSERT INTO NavigationItems (RoleID, ItemKey, Label, Icon, SortOrder)
SELECT UserRoleID, 'planning', 'Planning', 'map', 1 FROM UserRoles WHERE Name = 'logistics_coordinator'
UNION ALL
SELECT UserRoleID, 'routes', 'Routes', 'route', 2 FROM UserRoles WHERE Name = 'logistics_coordinator';

-- Auditor
INSERT INTO NavigationItems (RoleID, ItemKey, Label, Icon, SortOrder)
SELECT UserRoleID, 'audits', 'Audits', 'check-circle', 1 FROM UserRoles WHERE Name = 'auditor';

-- Technician
INSERT INTO NavigationItems (RoleID, ItemKey, Label, Icon, SortOrder)
SELECT UserRoleID, 'maintenance', 'Maintenance', 'wrench', 1 FROM UserRoles WHERE Name = 'technician';
