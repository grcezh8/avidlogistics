# Configuration Validation Script
# Validates that frontend and backend are properly configured

Write-Host "🔍 Validating AVID Logistics Configuration" -ForegroundColor Green

$errors = @()
$warnings = @()

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Checking configuration files..." -ForegroundColor Cyan

# Check backend launch settings
$launchSettingsPath = "backend/AVIDLogistics.WebApi/Properties/launchSettings.json"
if (Test-Path $launchSettingsPath) {
    try {
        $launchSettings = Get-Content $launchSettingsPath | ConvertFrom-Json
        $backendUrl = $launchSettings.profiles.http.applicationUrl
        $backendPort = $backendUrl -replace "http://localhost:", ""
        Write-Host "✅ Backend configured: $backendUrl" -ForegroundColor Green
    } catch {
        $errors += "Invalid JSON in $launchSettingsPath"
        Write-Host "❌ Invalid JSON in launch settings" -ForegroundColor Red
    }
} else {
    $errors += "Missing launch settings file: $launchSettingsPath"
    Write-Host "❌ Missing launch settings file" -ForegroundColor Red
}

# Check frontend .env file
$envPath = "frontend/.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $apiUrlLine = $envContent | Where-Object { $_ -match "REACT_APP_API_BASE_URL" }
    if ($apiUrlLine) {
        $apiUrl = $apiUrlLine -replace "REACT_APP_API_BASE_URL=", ""
        Write-Host "✅ Frontend API URL: $apiUrl" -ForegroundColor Green
        
        # Extract port from API URL
        if ($apiUrl -match "http://localhost:(\d+)/api") {
            $frontendConfiguredPort = $matches[1]
        }
    } else {
        $errors += "Missing REACT_APP_API_BASE_URL in $envPath"
        Write-Host "❌ Missing API URL in .env file" -ForegroundColor Red
    }
} else {
    $errors += "Missing .env file: $envPath"
    Write-Host "❌ Missing .env file" -ForegroundColor Red
}

# Check for port consistency
if ($backendPort -and $frontendConfiguredPort) {
    if ($backendPort -eq $frontendConfiguredPort) {
        Write-Host "✅ Port configuration consistent: $backendPort" -ForegroundColor Green
    } else {
        $errors += "Port mismatch: Backend=$backendPort, Frontend=$frontendConfiguredPort"
        Write-Host "❌ Port mismatch detected!" -ForegroundColor Red
        Write-Host "   Backend: $backendPort" -ForegroundColor Yellow
        Write-Host "   Frontend: $frontendConfiguredPort" -ForegroundColor Yellow
    }
}

# Check API client configuration
$apiClientPath = "frontend/src/services/apiClient.js"
if (Test-Path $apiClientPath) {
    $apiClientContent = Get-Content $apiClientPath -Raw
    if ($apiClientContent -match "process\.env\.REACT_APP_API_BASE_URL") {
        Write-Host "✅ API client uses environment variables" -ForegroundColor Green
    } else {
        $warnings += "API client may have hardcoded URLs"
        Write-Host "⚠️  API client may have hardcoded URLs" -ForegroundColor Yellow
    }
} else {
    $warnings += "Missing API client file: $apiClientPath"
    Write-Host "⚠️  Missing API client file" -ForegroundColor Yellow
}

# Check for hardcoded ports in Program.cs
$programPath = "backend/AVIDLogistics.WebApi/Program.cs"
if (Test-Path $programPath) {
    $programContent = Get-Content $programPath -Raw
    if ($programContent -match "\.UseUrls\(" -or $programContent -match "webBuilder\.UseUrls") {
        $warnings += "Program.cs may contain hardcoded port configuration"
        Write-Host "⚠️  Program.cs may contain hardcoded ports" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Program.cs appears to use launch settings" -ForegroundColor Green
    }
}

Write-Host "`n🧪 Testing connectivity..." -ForegroundColor Cyan

# Test if backend is running
if ($backendPort) {
    try {
        $healthUrl = "http://localhost:$backendPort/health"
        $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend health check passed: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $warnings += "Backend not running or health check failed"
        Write-Host "⚠️  Backend not running or unreachable" -ForegroundColor Yellow
        Write-Host "   Try: cd backend/AVIDLogistics.WebApi && dotnet run --launch-profile http" -ForegroundColor Gray
    }
}

# Summary
Write-Host "`n📊 Validation Summary:" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! Configuration is correct." -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ Errors found:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "   • $_" -ForegroundColor Red }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  Warnings:" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }
    }
    
    Write-Host "`n🛠️  Suggested actions:" -ForegroundColor Cyan
    Write-Host "1. Run setup script: .\scripts\setup-dev-environment.ps1" -ForegroundColor White
    Write-Host "2. Review configuration guide: docs\CONFIGURATION_MANAGEMENT.md" -ForegroundColor White
}

Write-Host "`n📚 For more information, see: docs/CONFIGURATION_MANAGEMENT.md" -ForegroundColor Gray
