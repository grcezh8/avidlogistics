# Test frontend-compatible payload
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$payload = @{
    serialNumber = "FRONTEND-$timestamp"
    assetType = "Voting Machine"
    barcode = ""
    rfidTag = "RFID-FRONTEND-$timestamp"
    location = "Warehouse"
    facilityId = $null
} | ConvertTo-Json

Write-Host "Testing frontend-compatible payload..." -ForegroundColor Green
Write-Host "Payload: $payload" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" -Method POST -Body $payload -ContentType "application/json"
    Write-Host "✅ Frontend-compatible asset created successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
