# PowerShell script to test API connection by fetching assets

Write-Host "Testing API connection..." -ForegroundColor Green
Write-Host "Fetching assets from: http://localhost:5166/api/assets" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5166/api/assets" `
        -Method Get `
        -ContentType "application/json"
    
    Write-Host "API connection successful!" -ForegroundColor Green
    Write-Host "Number of assets found: $($response.Count)" -ForegroundColor Cyan
    
    if ($response.Count -gt 0) {
        Write-Host ""
        Write-Host "First few assets:" -ForegroundColor Yellow
        $response | Select-Object -First 3 | ForEach-Object {
            Write-Host "- Serial: $($_.serialNumber), Type: $($_.assetType), Status: $($_.status)"
        }
    }
}
catch {
    Write-Host "Error connecting to API:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}