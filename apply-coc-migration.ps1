# Apply Chain of Custody Database Migration
Write-Host "Applying Chain of Custody Database Migration..." -ForegroundColor Green

# Read the migration SQL
$migrationSql = Get-Content "database/migrations/013_enhance_coc_schema.sql" -Raw

# Connection string from appsettings.json
$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=AVIDLogistics;Trusted_Connection=true;MultipleActiveResultSets=true"

try {
    # Load SQL Server module
    Import-Module SqlServer -ErrorAction SilentlyContinue
    
    if (Get-Module -Name SqlServer) {
        Write-Host "Using SqlServer PowerShell module..." -ForegroundColor Yellow
        Invoke-Sqlcmd -ConnectionString $connectionString -Query $migrationSql -Verbose
    } else {
        Write-Host "SqlServer module not available, using .NET SqlConnection..." -ForegroundColor Yellow
        
        # Use .NET SqlConnection directly
        Add-Type -AssemblyName System.Data
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = $connection.CreateCommand()
        $command.CommandText = $migrationSql
        $command.ExecuteNonQuery()
        
        $connection.Close()
    }
    
    Write-Host "Migration applied successfully!" -ForegroundColor Green
    
    # Verify tables were created
    $verifyQuery = "SELECT name FROM sys.tables WHERE name IN ('CoCFormStatuses', 'Signatures') ORDER BY name"
    
    if (Get-Module -Name SqlServer) {
        $tables = Invoke-Sqlcmd -ConnectionString $connectionString -Query $verifyQuery
    } else {
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandText = $verifyQuery
        $reader = $command.ExecuteReader()
        $tables = @()
        while ($reader.Read()) {
            $tables += $reader["name"]
        }
        $reader.Close()
        $connection.Close()
    }
    
    Write-Host "Verified tables created:" -ForegroundColor Green
    $tables | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
    
} catch {
    Write-Host "Error applying migration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor Red
}
