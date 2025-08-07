# Test with the exact payload the frontend sends
$body = @{
    serialNumber = "FRONTEND001"
    assetType = "Voting Machine"
    barcode = "BC001"
    rfidTag = "RF001"
    quantity = 1
    condition = "New"
    location = "Warehouse"
    facilityId = $null
    notes = "Test from frontend"
} | ConvertTo-Json

Write-Host "Sending payload:"
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5166/api/assets" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success: $($response.StatusCode)"
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
