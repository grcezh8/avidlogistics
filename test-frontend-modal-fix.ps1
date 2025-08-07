# Test script to verify frontend modal compatibility with backend API
$baseUrl = "http://localhost:5166"

Write-Host "=== FRONTEND MODAL COMPATIBILITY TEST ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verify backend is running
Write-Host "1. Testing backend connectivity..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start the backend first." -ForegroundColor Red
    exit 1
}

# Test 2: Test with frontend-compatible payload (matching the fixed modal)
Write-Host ""
Write-Host "2. Testing frontend-compatible asset creation..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$frontendPayload = @{
    serialNumber = "FRONTEND-$timestamp"
    assetType = "Voting Machine"
    barcode = ""  # Empty string (frontend sends empty, not null)
    rfidTag = "RFID-FRONTEND-$timestamp"
    location = "Warehouse"
    facilityId = ""  # Empty string (frontend sends empty, not null)
} | ConvertTo-Json

Write-Host "Frontend payload:" -ForegroundColor Cyan
Write-Host $frontendPayload

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $frontendPayload -ContentType "application/json"
    Write-Host "✅ Frontend-compatible asset created successfully!" -ForegroundColor Green
    Write-Host "Asset ID: $($response.id)" -ForegroundColor Green
    Write-Host "Generated Barcode: $($response.barcode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend-compatible asset creation failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

# Test 3: Test with null values (what backend might receive)
Write-Host ""
Write-Host "3. Testing with null values..." -ForegroundColor Yellow

$timestamp2 = Get-Date -Format "yyyyMMddHHmmss"
$nullPayload = @{
    serialNumber = "NULL-TEST-$timestamp2"
    assetType = "Ballot Box"
    barcode = $null
    rfidTag = $null
    location = "Warehouse"
    facilityId = $null
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $nullPayload -ContentType "application/json"
    Write-Host "✅ Null values handled correctly!" -ForegroundColor Green
    Write-Host "Asset ID: $($response2.id)" -ForegroundColor Green
    Write-Host "Generated Barcode: $($response2.barcode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Null values test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 4: Test missing required fields
Write-Host ""
Write-Host "4. Testing validation (missing serial number)..." -ForegroundColor Yellow

$invalidPayload = @{
    assetType = "Scanner"
    barcode = ""
    rfidTag = ""
    location = "Warehouse"
    facilityId = ""
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method POST -Body $invalidPayload -ContentType "application/json"
    Write-Host "❌ Validation failed - should have rejected missing serial number" -ForegroundColor Red
} catch {
    Write-Host "✅ Validation working correctly - rejected missing serial number" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Expected error: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Frontend modal should now be compatible with the backend API." -ForegroundColor Green
Write-Host "Key fixes applied:" -ForegroundColor Yellow
Write-Host "- Removed unsupported fields: quantity, condition, notes" -ForegroundColor White
Write-Host "- Fixed form data structure to match RegisterAssetInput DTO" -ForegroundColor White
Write-Host "- Updated form reset logic" -ForegroundColor White
Write-Host "- Backend generates barcode automatically when not provided" -ForegroundColor White
