# Test with Authorization header like the frontend sends
$body = @{
    serialNumber = "AUTHTEST001"
    assetType = "Ballot Box"
    barcode = "BC001"
    rfidTag = "RF001"
} | ConvertTo-Json

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer fake-token-123'
}

Write-Host "Sending request with Authorization header..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5166/api/assets" -Method POST -Body $body -Headers $headers
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
