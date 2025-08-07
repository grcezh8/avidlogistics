# Development Environment Setup Script
# This script ensures consistent configuration between frontend and backend

param(
    [string]$BackendPort = "5166",
    [string]$FrontendPort = "3000"
)

Write-Host "🚀 Setting up AVID Logistics Development Environment" -ForegroundColor Green
Write-Host "Backend Port: $BackendPort" -ForegroundColor Yellow
Write-Host "Frontend Port: $FrontendPort" -ForegroundColor Yellow

# Function to update JSON file
function Update-JsonFile {
    param(
        [string]$FilePath,
        [string]$JsonPath,
        [string]$NewValue
    )
    
    if (Test-Path $FilePath) {
        $json = Get-Content $FilePath | ConvertFrom-Json
        $json.profiles.http.applicationUrl = "http://localhost:$NewValue"
        $json | ConvertTo-Json -Depth 10 | Set-Content $FilePath
        Write-Host "✅ Updated $FilePath" -ForegroundColor Green
    } else {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    }
}

# Function to update .env file
function Update-EnvFile {
    param(
        [string]$FilePath,
        [string]$Port
    )
    
    $envContent = @"
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:$Port/api
REACT_APP_API_TIMEOUT=10000

# Other environment variables can be added here
"@
    
    Set-Content -Path $FilePath -Value $envContent
    Write-Host "✅ Updated $FilePath" -ForegroundColor Green
}

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Updating configuration files..." -ForegroundColor Cyan

# Update backend launch settings
$launchSettingsPath = "backend/AVIDLogistics.WebApi/Properties/launchSettings.json"
Update-JsonFile -FilePath $launchSettingsPath -JsonPath "profiles.http.applicationUrl" -NewValue $BackendPort

# Update frontend .env files
Update-EnvFile -FilePath "frontend/.env" -Port $BackendPort
Update-EnvFile -FilePath "frontend/.env.development" -Port $BackendPort

Write-Host "`n🔍 Validating configuration..." -ForegroundColor Cyan

# Validate backend configuration
if (Test-Path $launchSettingsPath) {
    $launchSettings = Get-Content $launchSettingsPath | ConvertFrom-Json
    $configuredPort = $launchSettings.profiles.http.applicationUrl -replace "http://localhost:", ""
    if ($configuredPort -eq $BackendPort) {
        Write-Host "✅ Backend configured for port $BackendPort" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend port mismatch: expected $BackendPort, found $configuredPort" -ForegroundColor Red
    }
}

# Validate frontend configuration
if (Test-Path "frontend/.env") {
    $envContent = Get-Content "frontend/.env"
    $apiUrl = ($envContent | Where-Object { $_ -match "REACT_APP_API_BASE_URL" }) -replace "REACT_APP_API_BASE_URL=", ""
    $expectedUrl = "http://localhost:$BackendPort/api"
    if ($apiUrl -eq $expectedUrl) {
        Write-Host "✅ Frontend configured for API URL $apiUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend API URL mismatch: expected $expectedUrl, found $apiUrl" -ForegroundColor Red
    }
}

Write-Host "`n🛠️  Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend/AVIDLogistics.WebApi && dotnet run --launch-profile http" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm start" -ForegroundColor White
Write-Host "3. Test API connectivity: http://localhost:$BackendPort/health" -ForegroundColor White

Write-Host "`n✨ Development environment setup complete!" -ForegroundColor Green
