# Test with a unique serial number to confirm the fix
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$body = @{
    serialNumber = "TEST$timestamp"
    assetType = "Voting Machine"
    barcode = "BC$timestamp"
    rfidTag = "RF$timestamp"
    quantity = 1
    condition = "New"
    location = "Warehouse"
    facilityId = $null
    notes = "Final test - fix confirmed"
} | ConvertTo-Json

Write-Host "Testing with unique serial number: TEST$timestamp"
Write-Host "Sending payload:"
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5166/api/assets" -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
