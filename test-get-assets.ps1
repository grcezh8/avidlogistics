try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5166/api/assets' -Method GET
    Write-Host "SUCCESS: Assets retrieved"
    Write-Host "Count: $($response.Count)"
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
