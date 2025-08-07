# Clean restart script for AVID Logistics
Write-Host "🧹 AVID Logistics Clean Restart Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Kill existing processes
Write-Host "`n1. Stopping existing processes..." -ForegroundColor Yellow

# Kill dotnet processes
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    Write-Host "   Stopping $($dotnetProcesses.Count) dotnet process(es)..." -ForegroundColor Red
    $dotnetProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
} else {
    Write-Host "   No dotnet processes found" -ForegroundColor Green
}

# Kill node processes (frontend)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Stopping $($nodeProcesses.Count) node process(es)..." -ForegroundColor Red
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
} else {
    Write-Host "   No node processes found" -ForegroundColor Green
}

# Step 2: Clean build
Write-Host "`n2. Cleaning and building backend..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    
    Write-Host "   Running dotnet clean..." -ForegroundColor Gray
    dotnet clean --verbosity quiet
    
    Write-Host "   Running dotnet build..." -ForegroundColor Gray
    $buildResult = dotnet build --verbosity quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend build successful!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend build failed!" -ForegroundColor Red
        Write-Host "   Build output: $buildResult" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Set-Location ".."
} catch {
    Write-Host "   ❌ Error during backend build: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Step 3: Start backend
Write-Host "`n3. Starting backend server..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    
    Write-Host "   Starting on http://localhost:5166..." -ForegroundColor Gray
    Start-Process -FilePath "dotnet" -ArgumentList "run", "--project", "AVIDLogistics.WebApi", "--urls", "http://localhost:5166" -WindowStyle Normal
    
    Set-Location ".."
    Write-Host "   ✅ Backend server started!" -ForegroundColor Green
    Write-Host "   Backend should be available at: http://localhost:5166" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ".."
}

# Step 4: Wait and test backend
Write-Host "`n4. Waiting for backend to start..." -ForegroundColor Yellow
Write-Host "   Waiting 10 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "   Testing backend health..." -ForegroundColor Gray
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5166/api/health" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Backend health check passed!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend health check failed - it might still be starting up" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Start frontend
Write-Host "`n5. Starting frontend..." -ForegroundColor Yellow
try {
    Set-Location "frontend"
    
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install --silent
    
    Write-Host "   Starting React development server..." -ForegroundColor Gray
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal
    
    Set-Location ".."
    Write-Host "   ✅ Frontend server started!" -ForegroundColor Green
    Write-Host "   Frontend should be available at: http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error starting frontend: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ".."
}

# Step 6: Final instructions
Write-Host "`n🎉 Clean restart completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait 30-60 seconds for both servers to fully start" -ForegroundColor White
Write-Host "2. Open your browser to: http://localhost:3000" -ForegroundColor White
Write-Host "3. Test the Add Asset functionality" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful commands:" -ForegroundColor Cyan
Write-Host "• Test backend: .\test-backend-connection.ps1" -ForegroundColor White
Write-Host "• Check processes: .\check-running-processes.ps1" -ForegroundColor White
Write-Host "• Backend API: http://localhost:5166/api/assets" -ForegroundColor White
Write-Host ""
Write-Host "If you still can't see assets, run the test script to diagnose:" -ForegroundColor Yellow
Write-Host ".\test-backend-connection.ps1" -ForegroundColor Yellow
