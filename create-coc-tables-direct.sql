-- Create CoCFormStatuses table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CoCFormStatuses' AND xtype='U')
CREATE TABLE [CoCFormStatuses] (
    [CoCFormStatusId] int NOT NULL IDENTITY,
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

-- Create Signatures table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Signatures' AND xtype='U')
CREATE TABLE [Signatures] (
    [SignatureId] int NOT NULL IDENTITY,
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

-- Add indexes for CoCFormStatuses
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_FormUrl')
CREATE UNIQUE INDEX [IX_CoCFormStatuses_FormUrl] ON [CoCFormStatuses] ([FormUrl]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_ManifestId')
CREATE UNIQUE INDEX [IX_CoCFormStatuses_ManifestId] ON [CoCFormStatuses] ([ManifestId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CoCFormStatuses_Status')
CREATE INDEX [IX_CoCFormStatuses_Status] ON [CoCFormStatuses] ([Status]);

-- Add indexes for Signatures
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Signatures_ChainOfCustodyEventId')
CREATE INDEX [IX_Signatures_ChainOfCustodyEventId] ON [Signatures] ([ChainOfCustodyEventId]);

-- Add foreign key constraints if the referenced tables exist
IF EXISTS (SELECT * FROM sysobjects WHERE name='Manifests' AND xtype='U')
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_CoCFormStatuses_Manifests_ManifestId')
ALTER TABLE [CoCFormStatuses] ADD CONSTRAINT [FK_CoCFormStatuses_Manifests_ManifestId] 
    FOREIGN KEY ([ManifestId]) REFERENCES [Manifests] ([ManifestId]) ON DELETE CASCADE;

IF EXISTS (SELECT * FROM sysobjects WHERE name='ChainOfCustodyEvents' AND xtype='U')
    AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Signatures_ChainOfCustodyEvents_ChainOfCustodyEventId')
ALTER TABLE [Signatures] ADD CONSTRAINT [FK_Signatures_ChainOfCustodyEvents_ChainOfCustodyEventId] 
    FOREIGN KEY ([ChainOfCustodyEventId]) REFERENCES [ChainOfCustodyEvents] ([EventId]) ON DELETE CASCADE;

SELECT 'CoC tables created successfully' as Result;
