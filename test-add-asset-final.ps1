# Test the Add Asset functionality
$baseUrl = "http://localhost:5166"

# Test payload for creating an asset with unique serial number
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$assetData = @{
    serialNumber = "TEST-FINAL-$timestamp"
    assetType = "Voting Machine"
    barcode = $null
    rfidTag = "RFID-TEST-$timestamp"
    location = "Warehouse"
    facilityId = 1
} | ConvertTo-Json

Write-Host "Testing Add Asset functionality..." -ForegroundColor Green
Write-Host "Payload: $assetData" -ForegroundColor Yellow

try {
    # Test the POST request
    $response = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $assetData -ContentType "application/json"
    
    Write-Host "✅ Asset created successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ Error creating asset:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}
