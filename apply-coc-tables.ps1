# Apply Chain of Custody Tables Script
Write-Host "Creating Chain of Custody database tables..." -ForegroundColor Green

# Read the SQL script
$sqlScript = Get-Content "create-coc-tables.sql" -Raw

# Connection string from appsettings.json
$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=AVIDLogistics;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Use .NET SqlConnection directly since it's more reliable
    Add-Type -AssemblyName System.Data
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "Connected to database successfully" -ForegroundColor Yellow
    
    $command = $connection.CreateCommand()
    $command.CommandText = $sqlScript
    $result = $command.ExecuteNonQuery()
    
    Write-Host "SQL script executed successfully!" -ForegroundColor Green
    
    # Verify tables were created
    $verifyQuery = "SELECT name FROM sys.tables WHERE name IN ('CoCFormStatuses', 'Signatures') ORDER BY name"
    $command.CommandText = $verifyQuery
    $reader = $command.ExecuteReader()
    
    $tables = @()
    while ($reader.Read()) {
        $tables += $reader["name"]
    }
    $reader.Close()
    $connection.Close()
    
    Write-Host "Verified tables created:" -ForegroundColor Green
    $tables | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Cyan }
    
    if ($tables.Count -eq 2) {
        Write-Host "SUCCESS: All Chain of Custody tables created!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Expected 2 tables, found $($tables.Count)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error creating tables: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor Red
}
