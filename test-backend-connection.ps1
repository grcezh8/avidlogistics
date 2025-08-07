# Test backend connection and API endpoints
$baseUrl = "http://localhost:5166"

Write-Host "Testing backend connection..." -ForegroundColor Green

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get assets (should return empty array if no assets)
Write-Host "`n2. Testing GET /api/assets..." -ForegroundColor Yellow
try {
    $assetsResponse = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method GET
    Write-Host "✅ GET assets successful!" -ForegroundColor Green
    Write-Host "Found $($assetsResponse.Count) assets" -ForegroundColor Cyan
    if ($assetsResponse.Count -gt 0) {
        Write-Host "Assets:" -ForegroundColor Cyan
        $assetsResponse | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "❌ GET assets failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

# Test 3: Create a new asset
Write-Host "`n3. Testing POST /api/assets..." -ForegroundColor Yellow
$assetData = @{
    assetType = "Test Voting Machine"
    barcode = $null
    rfidTag = "RFID-TEST-001"
    location = "Warehouse"
    facilityId = 1
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $assetData -ContentType "application/json"
    Write-Host "✅ Asset created successfully!" -ForegroundColor Green
    Write-Host "Created asset:" -ForegroundColor Cyan
    $createResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Asset creation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

# Test 4: Get assets again to see if the new asset appears
Write-Host "`n4. Testing GET /api/assets again..." -ForegroundColor Yellow
try {
    $assetsResponse2 = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method GET
    Write-Host "✅ GET assets successful!" -ForegroundColor Green
    Write-Host "Found $($assetsResponse2.Count) assets" -ForegroundColor Cyan
    if ($assetsResponse2.Count -gt 0) {
        Write-Host "Assets:" -ForegroundColor Cyan
        $assetsResponse2 | ConvertTo-Json -Depth 2
    }
} catch {
    Write-Host "❌ GET assets failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
