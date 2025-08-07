# PowerShell script to create a test asset via API

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$serialNumber = "TEST-$timestamp"
$barcode = "BAR-$timestamp"
$rfidTag = "RFID-$timestamp"

Write-Host "Creating test asset with:" -ForegroundColor Green
Write-Host "Serial Number: $serialNumber"
Write-Host "Asset Type: VotingMachine"
Write-Host "Barcode: $barcode"
Write-Host ""

$body = @{
    serialNumber = $serialNumber
    assetType = "VotingMachine"
    barcode = $barcode
    rfidTag = $rfidTag
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Asset created successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json | Write-Host
    Write-Host ""
    Write-Host "Now check the inventory page to see if this asset appears." -ForegroundColor Cyan
    Write-Host "Look for Serial Number: $serialNumber" -ForegroundColor Cyan
}
catch {
    Write-Host "Error creating asset:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}