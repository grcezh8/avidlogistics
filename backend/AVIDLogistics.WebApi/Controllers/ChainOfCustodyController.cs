using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Application.Services;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChainOfCustodyController : ControllerBase
    {
        private readonly ChainOfCustodyRepository _chainOfCustodyRepository;
        private readonly CoCFormGenerationService _cocFormGenerationService;
        private readonly ISignatureRepository _signatureRepository;
        private readonly ICoCFormStatusRepository _cocFormStatusRepository;
        private readonly AVIDLogistics.Application.Services.CoCNotificationService _cocNotificationService;
        private readonly WarehouseDbContext _dbContext;

        public ChainOfCustodyController(
            ChainOfCustodyRepository chainOfCustodyRepository,
            CoCFormGenerationService cocFormGenerationService,
            ISignatureRepository signatureRepository,
            ICoCFormStatusRepository cocFormStatusRepository,
            AVIDLogistics.Application.Services.CoCNotificationService cocNotificationService,
            WarehouseDbContext dbContext)
        {
            _chainOfCustodyRepository = chainOfCustodyRepository;
            _cocFormGenerationService = cocFormGenerationService;
            _signatureRepository = signatureRepository;
            _cocFormStatusRepository = cocFormStatusRepository;
            _cocNotificationService = cocNotificationService;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get chain of custody events
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetChainOfCustodyEvents([FromQuery] int? electionId = null, [FromQuery] int? assetId = null)
        {
            try
            {
                IEnumerable<ChainOfCustodyEvent> events;
                
                if (electionId.HasValue)
                {
                    events = await _chainOfCustodyRepository.GetByElectionIdAsync(electionId.Value);
                }
                else if (assetId.HasValue)
                {
                    events = await _chainOfCustodyRepository.GetByAssetIdAsync(assetId.Value);
                }
                else
                {
                    // Return empty list if no filters provided
                    events = new List<ChainOfCustodyEvent>();
                }
                
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get chain of custody event by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetChainOfCustodyEvent(int id)
        {
            try
            {
                var custodyEvent = await _chainOfCustodyRepository.GetByIdAsync(id);
                if (custodyEvent == null)
                {
                    return NotFound(new { message = "Chain of custody event not found" });
                }

                return Ok(custodyEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new chain of custody event
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateChainOfCustodyEvent([FromBody] CreateChainOfCustodyDto request)
        {
            try
            {
                var custodyEvent = new ChainOfCustodyEvent(
                    request.ElectionId, 
                    request.AssetId, 
                    request.FromParty, 
                    request.ToParty, 
                    request.SealNumber, 
                    1, // Default createdBy = 1
                    request.Notes
                );
                
                var eventId = await _chainOfCustodyRepository.SaveAsync(custodyEvent);
                var createdEvent = await _chainOfCustodyRepository.GetByIdAsync(eventId);
                
                return CreatedAtAction(nameof(GetChainOfCustodyEvent), new { id = eventId }, createdEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Generate digital CoC form for a manifest
        /// </summary>
        [HttpPost("generate-form")]
        public async Task<IActionResult> GenerateDigitalCoCForm([FromBody] GenerateCoCFormInput request)
        {
            try
            {
                var formData = await _cocFormGenerationService.GenerateDigitalCoCFormAsync(request);
                return Ok(formData);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get CoC form by manifest ID
        /// </summary>
        [HttpGet("manifest/{manifestId}/form")]
        public async Task<IActionResult> GetCoCFormByManifest(int manifestId)
        {
            try
            {
                var formStatus = await _cocFormStatusRepository.GetByManifestIdAsync(manifestId);
                if (formStatus == null)
                {
                    return NotFound(new { message = "CoC form not found for this manifest" });
                }

                var formData = await _cocFormGenerationService.GetCoCFormByUrlAsync(formStatus.FormUrl);
                return Ok(formData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get CoC form HTML by form URL (public endpoint)
        /// </summary>
        [HttpGet("form/{formId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCoCFormHtml(string formId)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var formUrl = $"{baseUrl}/api/chainofcustody/form/{formId}";
                
                var formData = await _cocFormGenerationService.GetCoCFormByUrlAsync(formUrl);
                var html = await _cocFormGenerationService.GenerateFormHtmlAsync(formData);
                
                return Content(html, "text/html");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Submit digital signature for CoC form
        /// </summary>
        [HttpPost("sign")]
        public async Task<IActionResult> SubmitSignature([FromBody] CreateSignatureInput request)
        {
            try
            {
                // Get client IP and User Agent
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = Request.Headers["User-Agent"].ToString();

                var signature = new Signature(
                    request.ChainOfCustodyEventId,
                    request.SignedBy,
                    request.SignatureType,
                    request.SignatureImageUrl,
                    ipAddress,
                    userAgent);

                var signatureId = await _signatureRepository.SaveAsync(signature);

                // Update form status
                var cocEvent = await _chainOfCustodyRepository.GetByIdAsync(request.ChainOfCustodyEventId);
                if (cocEvent?.ManifestId.HasValue == true)
                {
                    var formStatus = await _cocFormStatusRepository.GetByManifestIdAsync(cocEvent.ManifestId.Value);
                    if (formStatus != null)
                    {
                        formStatus.AddSignature();
                        await _cocFormStatusRepository.UpdateAsync(formStatus);
                    }
                }

                return Ok(new { signatureId, message = "Signature submitted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get unresolved CoC forms (missing signatures)
        /// </summary>
        [HttpGet("unresolved")]
        public async Task<IActionResult> GetUnresolvedForms()
        {
            try
            {
                var unresolvedForms = await _cocFormStatusRepository.GetUnresolvedFormsAsync();
                return Ok(unresolvedForms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get asset custody history
        /// </summary>
        [HttpGet("asset/{assetId}/history")]
        public async Task<IActionResult> GetAssetCustodyHistory(int assetId)
        {
            try
            {
                var events = await _chainOfCustodyRepository.GetByAssetIdAsync(assetId);
                var history = events.OrderBy(e => e.DateTime).ToList();
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Log a new custody event
        /// </summary>
        [HttpPost("event")]
        public async Task<IActionResult> LogCustodyEvent([FromBody] CreateChainOfCustodyEventInput request)
        {
            try
            {
                var custodyEvent = new ChainOfCustodyEvent(
                    request.ElectionId,
                    request.AssetId,
                    request.FromParty,
                    request.ToParty,
                    request.SealNumber,
                    1, // TODO: Get from authenticated user
                    request.Notes,
                    null, // scannedFormId
                    request.EventType ?? "Transfer",
                    request.FromOrg,
                    request.ToOrg,
                    null, // signatureImageUrl
                    request.ManifestId);

                var eventId = await _chainOfCustodyRepository.SaveAsync(custodyEvent);
                var createdEvent = await _chainOfCustodyRepository.GetByIdAsync(eventId);

                return CreatedAtAction(nameof(GetChainOfCustodyEvent), new { id = eventId }, createdEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get CoC alerts for overdue signatures and expired forms
        /// </summary>
        [HttpGet("alerts")]
        public async Task<IActionResult> GetCoCAlerts()
        {
            try
            {
                var alerts = await _cocNotificationService.GetOverdueAlertsAsync();
                return Ok(new { alerts, count = alerts.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Trigger notification check for overdue signatures (admin endpoint)
        /// </summary>
        [HttpPost("check-notifications")]
        public async Task<IActionResult> CheckNotifications()
        {
            try
            {
                await _cocNotificationService.CheckAndNotifyOverdueSignaturesAsync();
                return Ok(new { message = "Notification check completed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create missing CoC database tables (temporary admin endpoint)
        /// </summary>
        [HttpPost("create-tables")]
        public async Task<IActionResult> CreateCoCTables()
        {
            try
            {
                var sql = @"
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
";

                await _dbContext.Database.ExecuteSqlRawAsync(sql);
                
                // Verify tables were created
                var cocFormStatusExists = await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CoCFormStatuses'") >= 0;
                var signaturesExists = await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Signatures'") >= 0;
                
                return Ok(new { 
                    message = "CoC tables creation completed",
                    cocFormStatusTableCreated = cocFormStatusExists,
                    signaturesTableCreated = signaturesExists
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, details = ex.ToString() });
            }
        }
    }

    public class CreateChainOfCustodyDto
    {
        public int ElectionId { get; set; }
        public int AssetId { get; set; }
        public string FromParty { get; set; } = string.Empty;
        public string ToParty { get; set; } = string.Empty;
        public string? SealNumber { get; set; }
        public string? Notes { get; set; }
    }
}
