# PowerShell script to create CoC tables directly in the database
Write-Host "Creating Chain of Custody tables..." -ForegroundColor Green

# Get the connection string from appsettings.json
$appsettingsPath = "backend/AVIDLogistics.WebApi/appsettings.json"
$appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
$connectionString = $appsettings.ConnectionStrings.AVIDLogisticsDatabase

Write-Host "Using connection string: $connectionString" -ForegroundColor Yellow

# SQL to create the tables
$sql = @"
-- Create CoCFormStatuses table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CoCFormStatuses' AND xtype='U')
BEGIN
    CREATE TABLE [CoCFormStatuses] (
        [CoCFormStatusId] int NOT NULL IDENTITY(1,1),
        [ManifestId] int NOT NULL,
        [FormUrl] nvarchar(500) NOT NULL,
        [Status] nvarchar(50) NOT NULL,
        [RequiredSignatures] int NOT NULL,
        [CompletedSignatures] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CompletedAt] datetime2 NULL,
        [ExpiresAt] datetime2 NULL,
        [LastAccessedAt] datetime2 NULL,
        [AccessCount] int NOT NULL,
        CONSTRAINT [PK_CoCFormStatuses] PRIMARY KEY ([CoCFormStatusId])
    );
    PRINT 'CoCFormStatuses table created successfully';
END
ELSE
BEGIN
    PRINT 'CoCFormStatuses table already exists';
END

-- Create Signatures table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Signatures' AND xtype='U')
BEGIN
    CREATE TABLE [Signatures] (
        [SignatureId] int NOT NULL IDENTITY(1,1),
        [ChainOfCustodyEventId] int NOT NULL,
        [SignedBy] nvarchar(100) NOT NULL,
        [SignatureImageUrl] nvarchar(500) NULL,
        [SignedAt] datetime2 NOT NULL,
        [SignatureType] nvarchar(50) NOT NULL,
        [IpAddress] nvarchar(45) NULL,
        [UserAgent] nvarchar(500) NULL,
        [IsValid] bit NOT NULL,
        CONSTRAINT [PK_Signatures] PRIMARY KEY ([SignatureId])
    );
    PRINT 'Signatures table created successfully';
END
ELSE
BEGIN
    PRINT 'Signatures table already exists';
END

-- Add indexes for CoCFormStatuses
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_FormUrl')
BEGIN
    CREATE UNIQUE INDEX [IX_CoCFormStatuses_FormUrl] ON [CoCFormStatuses] ([FormUrl]);
    PRINT 'Index IX_CoCFormStatuses_FormUrl created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_ManifestId')
BEGIN
    CREATE UNIQUE INDEX [IX_CoCFormStatuses_ManifestId] ON [CoCFormStatuses] ([ManifestId]);
    PRINT 'Index IX_CoCFormStatuses_ManifestId created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_Status')
BEGIN
    CREATE INDEX [IX_CoCFormStatuses_Status] ON [CoCFormStatuses] ([Status]);
    PRINT 'Index IX_CoCFormStatuses_Status created';
END

-- Add indexes for Signatures
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Signatures_ChainOfCustodyEventId')
BEGIN
    CREATE INDEX [IX_Signatures_ChainOfCustodyEventId] ON [Signatures] ([ChainOfCustodyEventId]);
    PRINT 'Index IX_Signatures_ChainOfCustodyEventId created';
END

-- Add foreign key constraints if the referenced tables exist
IF EXISTS (SELECT * FROM sysobjects WHERE name='Manifests' AND xtype='U')
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_CoCFormStatuses_Manifests_ManifestId')
BEGIN
    ALTER TABLE [CoCFormStatuses] ADD CONSTRAINT [FK_CoCFormStatuses_Manifests_ManifestId] 
        FOREIGN KEY ([ManifestId]) REFERENCES [Manifests] ([ManifestId]) ON DELETE CASCADE;
    PRINT 'Foreign key FK_CoCFormStatuses_Manifests_ManifestId created';
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='ChainOfCustodyEvents' AND xtype='U')
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Signatures_ChainOfCustodyEvents_ChainOfCustodyEventId')
BEGIN
    ALTER TABLE [Signatures] ADD CONSTRAINT [FK_Signatures_ChainOfCustodyEvents_ChainOfCustodyEventId] 
        FOREIGN KEY ([ChainOfCustodyEventId]) REFERENCES [ChainOfCustodyEvents] ([EventId]) ON DELETE CASCADE;
    PRINT 'Foreign key FK_Signatures_ChainOfCustodyEvents_ChainOfCustodyEventId created';
END

SELECT 'Chain of Custody tables setup completed successfully!' as Result;
"@

try {
    # Use Invoke-Sqlcmd if available, otherwise use SqlConnection
    if (Get-Command "Invoke-Sqlcmd" -ErrorAction SilentlyContinue) {
        Write-Host "Using Invoke-Sqlcmd..." -ForegroundColor Cyan
        Invoke-Sqlcmd -ConnectionString $connectionString -Query $sql
    } else {
        Write-Host "Using .NET SqlConnection..." -ForegroundColor Cyan
        
        # Load System.Data.SqlClient
        Add-Type -AssemblyName System.Data
        
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $command = New-Object System.Data.SqlClient.SqlCommand($sql, $connection)
        
        try {
            $connection.Open()
            $result = $command.ExecuteNonQuery()
            Write-Host "SQL executed successfully. Rows affected: $result" -ForegroundColor Green
        }
        finally {
            $connection.Close()
        }
    }
    
    Write-Host "Chain of Custody tables created successfully!" -ForegroundColor Green
    Write-Host "You can now refresh the CoC page in the browser." -ForegroundColor Yellow
}
catch {
    Write-Host "Error creating tables: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor Red
}
