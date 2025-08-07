# Simple PowerShell script to test asset creation
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testAsset = @{
    serialNumber = "TEST-$timestamp"
    assetType = "VotingMachine"
    barcode = "BAR-$timestamp"
    rfidTag = "RFID-$timestamp"
} | ConvertTo-Json

Write-Host "Testing Asset Creation..." -ForegroundColor Green
Write-Host "Creating asset with serial number: TEST-$timestamp" -ForegroundColor Yellow

try {
    # First test if API is accessible
    Write-Host "`nTesting API connection..." -ForegroundColor Cyan
    $testResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" -Method Get
    Write-Host "API is accessible! Found $($testResponse.Count) existing assets." -ForegroundColor Green
    
    # Now create a new asset
    Write-Host "`nCreating new asset..." -ForegroundColor Cyan
    $createResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" `
        -Method Post `
        -Body $testAsset `
        -ContentType "application/json"
    
    Write-Host "Asset created successfully!" -ForegroundColor Green
    Write-Host "Created asset details:" -ForegroundColor Yellow
    $createResponse | ConvertTo-Json | Write-Host
    
    # Verify by fetching all assets again
    Write-Host "`nVerifying asset was created..." -ForegroundColor Cyan
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" -Method Get
    $newAsset = $verifyResponse | Where-Object { $_.serialNumber -eq "TEST-$timestamp" }
    
    if ($newAsset) {
        Write-Host "SUCCESS: Asset found in database!" -ForegroundColor Green
        Write-Host "Asset ID: $($newAsset.id)" -ForegroundColor Yellow
    } else {
        Write-Host "WARNING: Asset not found in database after creation" -ForegroundColor Red
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}