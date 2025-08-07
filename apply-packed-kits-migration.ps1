# PowerShell script to apply the packed kits migration
# This creates kits for previously packed manifests

Write-Host "Applying Packed Kits Migration..." -ForegroundColor Green

# Get connection string from appsettings.json
$appsettingsPath = "backend/AVIDLogistics.WebApi/appsettings.json"
if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
    $connectionString = $appsettings.ConnectionStrings.DefaultConnection
    Write-Host "Using connection string from appsettings.json" -ForegroundColor Yellow
} else {
    Write-Host "appsettings.json not found. Please ensure you're running from the project root." -ForegroundColor Red
    exit 1
}

# Migration file path
$migrationFile = "database/migrations/014_create_kits_for_existing_packed_manifests.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "Running migration: $migrationFile" -ForegroundColor Yellow

try {
    # Execute the migration
    sqlcmd -S "." -d "AVIDLogistics" -i $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your previously packed manifests should now have corresponding kits." -ForegroundColor Green
        Write-Host "You can view them in the 'Packed Kits' tab of the packing page." -ForegroundColor Green
    } else {
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Try running the SQL file directly in SQL Server Management Studio if sqlcmd is not working." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error running migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Alternative: Run the SQL file directly in SQL Server Management Studio:" -ForegroundColor Yellow
    Write-Host "File: $migrationFile" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your backend API if it's running" -ForegroundColor White
Write-Host "2. Refresh the packing page in your browser" -ForegroundColor White
Write-Host "3. Click on the 'Packed Kits' tab to see your existing packed manifests as kits" -ForegroundColor White
