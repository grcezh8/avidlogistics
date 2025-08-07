# Stop All Development Processes Script
# This script stops all running development processes and frees up ports

Write-Host "Stop All Development Processes" -ForegroundColor Red

# Function to kill processes by name
function Stop-ProcessesByName {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Stopping $($processes.Count) $ProcessName process(es)..." -ForegroundColor Yellow
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped $ProcessName processes" -ForegroundColor Green
    } else {
        Write-Host "No $ProcessName processes found" -ForegroundColor Gray
    }
}

# Function to kill processes by port
function Stop-ProcessesByPort {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        try {
            $connections = netstat -ano | Select-String ":$port "
            if ($connections) {
                Write-Host "Freeing port $port..." -ForegroundColor Yellow
                foreach ($connection in $connections) {
                    $parts = $connection.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
                    if ($parts.Length -ge 5) {
                        $pid = $parts[-1]
                        if ($pid -match '^\d+$') {
                            try {
                                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                                if ($process) {
                                    Write-Host "   Stopping PID $pid ($($process.ProcessName))" -ForegroundColor Gray
                                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                                }
                            } catch {
                                # Process might already be stopped
                            }
                        }
                    }
                }
                Write-Host "Port $port freed" -ForegroundColor Green
            } else {
                Write-Host "Port $port is not in use" -ForegroundColor Gray
            }
        } catch {
            Write-Host "Could not check port $port" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nStopping .NET processes..." -ForegroundColor Cyan
Stop-ProcessesByName "dotnet"
Stop-ProcessesByName "AVIDLogistics.WebApi"

Write-Host "`nStopping Node.js processes..." -ForegroundColor Cyan
Stop-ProcessesByName "node"
Stop-ProcessesByName "npm"
Stop-ProcessesByName "yarn"

Write-Host "`nStopping common development processes..." -ForegroundColor Cyan
Stop-ProcessesByName "webpack"
Stop-ProcessesByName "webpack-dev-server"
Stop-ProcessesByName "react-scripts"

Write-Host "`nFreeing common development ports..." -ForegroundColor Cyan
$commonPorts = @(3000, 3001, 5000, 5001, 5166, 5167, 8000, 8080, 8081, 9000, 9001)
Stop-ProcessesByPort $commonPorts

Write-Host "`nStopping IIS Express processes..." -ForegroundColor Cyan
Stop-ProcessesByName "iisexpress"
Stop-ProcessesByName "iisexpresstray"

Write-Host "`nStopping Visual Studio Code processes..." -ForegroundColor Cyan
# Only stop VS Code extensions, not the main VS Code process
$codeProcesses = Get-Process | Where-Object { 
    $_.ProcessName -like "*code*" -and 
    $_.ProcessName -ne "Code" -and 
    $_.MainWindowTitle -eq ""
}
if ($codeProcesses) {
    Write-Host "Stopping VS Code extension processes..." -ForegroundColor Yellow
    $codeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped VS Code extension processes" -ForegroundColor Green
}

Write-Host "`nCleaning up temporary files..." -ForegroundColor Cyan

# Clean up common temp directories
$tempDirs = @(
    "frontend/node_modules/.cache",
    "frontend/.next",
    "frontend/build",
    "frontend/dist",
    "backend/AVIDLogistics.WebApi/bin/Debug",
    "backend/AVIDLogistics.WebApi/obj"
)

foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Cleaned $dir" -ForegroundColor Green
        } catch {
            Write-Host "Could not clean $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nFinal port check..." -ForegroundColor Cyan
$stillInUse = @()
foreach ($port in $commonPorts) {
    $connections = netstat -ano | Select-String ":$port " -Quiet
    if ($connections) {
        $stillInUse += $port
    }
}

if ($stillInUse.Count -gt 0) {
    Write-Host "Some ports are still in use: $($stillInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "   You may need to restart your computer or manually stop these processes" -ForegroundColor Gray
} else {
    Write-Host "All common development ports are now free" -ForegroundColor Green
}

Write-Host "`nProcess cleanup summary:" -ForegroundColor Cyan
Write-Host "• .NET processes stopped" -ForegroundColor White
Write-Host "• Node.js processes stopped" -ForegroundColor White
Write-Host "• Development servers stopped" -ForegroundColor White
Write-Host "• Common ports freed" -ForegroundColor White
Write-Host "• Temporary files cleaned" -ForegroundColor White

Write-Host "`nReady for fresh start!" -ForegroundColor Green
Write-Host "You can now run:" -ForegroundColor Gray
Write-Host "• Backend: cd backend/AVIDLogistics.WebApi && dotnet run --launch-profile http" -ForegroundColor Gray
Write-Host "• Frontend: cd frontend && npm start" -ForegroundColor Gray
