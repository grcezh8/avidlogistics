$body = @{
    serialNumber = "TEST123"
    assetType = "Ballot Box"
    barcode = "BC123"
    rfidTag = "RF123"
} | ConvertTo-Json

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
