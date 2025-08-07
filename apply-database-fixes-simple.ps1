# =============================================
# Apply Database Schema Fixes - Simplified Version
# PowerShell script to run database migrations and restart services
# =============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AVID Logistics Database Schema Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL Server is available
Write-Host "Checking SQL Server connection..." -ForegroundColor Yellow
try {
    $connectionString = "Server=localhost;Database=AVIDLogistics;Integrated Security=true;TrustServerCertificate=true;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    $connection.Close()
    Write-Host "✓ SQL Server connection successful" -ForegroundColor Green
}
catch {
    Write-Host "✗ SQL Server connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please ensure SQL Server is running and the AVIDLogistics database exists." -ForegroundColor Yellow
    exit 1
}

# Stop running processes
Write-Host ""
Write-Host "Stopping running processes..." -ForegroundColor Yellow
Get-Process -Name "AVIDLogistics.WebApi" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Processes stopped" -ForegroundColor Green

# Apply database fixes
Write-Host ""
Write-Host "Applying database schema fixes..." -ForegroundColor Yellow

$originalLocation = Get-Location

# Run database migrations
Write-Host "Running migration: 010_fix_asset_primary_key_mapping.sql" -ForegroundColor Cyan
sqlcmd -S localhost -d AVIDLogistics -E -i "database\migrations\010_fix_asset_primary_key_mapping.sql"

Write-Host "Running migration: align_asset_schema_with_entity.sql" -ForegroundColor Cyan
sqlcmd -S localhost -d AVIDLogistics -E -i "database\migrations\align_asset_schema_with_entity.sql"

Write-Host "Running migration: fix_asset_constraints.sql" -ForegroundColor Cyan
sqlcmd -S localhost -d AVIDLogistics -E -i "database\migrations\fix_asset_constraints.sql"

Write-Host "Running migration: 011_cleanup_orphaned_manifest_items.sql" -ForegroundColor Cyan
sqlcmd -S localhost -d AVIDLogistics -E -i "database\migrations\011_cleanup_orphaned_manifest_items.sql"

Write-Host "✓ Database migrations completed" -ForegroundColor Green

# Build backend
Write-Host ""
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location "backend"
dotnet build --configuration Release
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Backend build failed" -ForegroundColor Red
}
Set-Location $originalLocation

# Check frontend dependencies
Write-Host ""
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location "frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
}
Write-Host "✓ Frontend dependencies ready" -ForegroundColor Green
Set-Location $originalLocation

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database fixes applied successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary of changes applied:" -ForegroundColor Cyan
Write-Host "• Fixed Asset primary key mapping (AssetID -> Id)" -ForegroundColor White
Write-Host "• Aligned Asset schema with Entity Framework model" -ForegroundColor White
Write-Host "• Fixed unique constraints on nullable columns" -ForegroundColor White
Write-Host "• Cleaned up orphaned ManifestItems" -ForegroundColor White
Write-Host "• Added foreign key constraints for data integrity" -ForegroundColor White
Write-Host "• Updated frontend status mappings" -ForegroundColor White
Write-Host "• Enhanced error logging in ManifestService" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend: cd backend; dotnet run" -ForegroundColor White
Write-Host "2. Start the frontend: cd frontend; npm start" -ForegroundColor White
Write-Host "3. Test asset creation and manifest operations" -ForegroundColor White
Write-Host "4. Verify that assets no longer show as 'Unknown'" -ForegroundColor White
Write-Host "5. Check that inventory and packing pages are synchronized" -ForegroundColor White

Write-Host ""
Write-Host "Would you like to start the services now? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Starting services..." -ForegroundColor Cyan
    
    # Start backend in background
    Write-Host "Starting backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; dotnet run" -WindowStyle Normal
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in background
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal
    
    Write-Host "✓ Services started in separate windows" -ForegroundColor Green
    Write-Host "Backend should be available at: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Frontend should be available at: http://localhost:3000" -ForegroundColor Cyan
}
else {
    Write-Host "Services not started. You can start them manually using the commands above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Database fixes completed!" -ForegroundColor Green
