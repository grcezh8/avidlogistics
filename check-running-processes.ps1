# Check for running processes on common ports
Write-Host "Checking for running processes on common ports..." -ForegroundColor Green

$ports = @(3000, 5000, 5166, 7155, 8080, 3001)

foreach ($port in $ports) {
    Write-Host "`nChecking port $port..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "✅ Port $port is in use by:" -ForegroundColor Red
                    Write-Host "   Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
                    Write-Host "   State: $($conn.State)" -ForegroundColor Red
                    
                    # Check if it's a dotnet process
                    if ($process.ProcessName -eq "dotnet") {
                        Write-Host "   This appears to be a .NET application" -ForegroundColor Yellow
                    }
                }
            }
        } else {
            Write-Host "   Port $port is free" -ForegroundColor Green
        }
    } catch {
        Write-Host "   Could not check port $port" -ForegroundColor Gray
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "=== DOTNET PROCESSES ===" -ForegroundColor Cyan
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    foreach ($proc in $dotnetProcesses) {
        Write-Host "Dotnet process found:" -ForegroundColor Yellow
        Write-Host "   PID: $($proc.Id)" -ForegroundColor White
        Write-Host "   Start Time: $($proc.StartTime)" -ForegroundColor White
        Write-Host "   CPU Time: $($proc.TotalProcessorTime)" -ForegroundColor White
        
        # Try to get command line (requires admin rights)
        try {
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            if ($commandLine) {
                Write-Host "   Command: $commandLine" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   Command: (Unable to retrieve - requires admin)" -ForegroundColor Gray
        }
        Write-Host ""
    }
} else {
    Write-Host "No dotnet processes found" -ForegroundColor Green
}

Write-Host "=== NODE PROCESSES ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "Node process found:" -ForegroundColor Yellow
        Write-Host "   PID: $($proc.Id)" -ForegroundColor White
        Write-Host "   Start Time: $($proc.StartTime)" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "No node processes found" -ForegroundColor Green
}

Write-Host "`n=== CLEANUP COMMANDS ===" -ForegroundColor Magenta
Write-Host "To kill all dotnet processes:" -ForegroundColor Yellow
Write-Host "   Get-Process -Name 'dotnet' | Stop-Process -Force" -ForegroundColor White
Write-Host ""
Write-Host "To kill all node processes:" -ForegroundColor Yellow
Write-Host "   Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor White
Write-Host ""
Write-Host "To kill a specific process by PID:" -ForegroundColor Yellow
Write-Host "   Stop-Process -Id <PID> -Force" -ForegroundColor White
