# Test script to verify asset creation is working
$baseUrl = "http://localhost:5166"

# Test data with unique serial numbers
$testAssets = @(
    @{
        serialNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')-001"
        assetType = "Voting Machine"
        barcode = "BC-$(Get-Date -Format 'yyyyMMdd-HHmmss')-001"
        rfidTag = "RFID-$(Get-Date -Format 'yyyyMMdd-HHmmss')-001"
        quantity = 1
        condition = "New"
        location = "Warehouse"
        facilityId = $null
        notes = "Test asset creation"
    },
    @{
        serialNumber = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')-002"
        assetType = "Ballot Scanner"
        barcode = "BC-$(Get-Date -Format 'yyyyMMdd-HHmmss')-002"
        rfidTag = $null
        quantity = 1
        condition = "New"
        location = "Warehouse"
        facilityId = $null
        notes = "Test asset creation without RFID"
    }
)

Write-Host "Testing Asset Creation API..." -ForegroundColor Green

foreach ($asset in $testAssets) {
    Write-Host "`nTesting asset: $($asset.serialNumber)" -ForegroundColor Yellow
    
    try {
        $jsonBody = $asset | ConvertTo-Json -Depth 3
        Write-Host "Request body: $jsonBody" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "✅ SUCCESS: Asset created successfully" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "Error details: $errorContent" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`nTest completed!" -ForegroundColor Green
