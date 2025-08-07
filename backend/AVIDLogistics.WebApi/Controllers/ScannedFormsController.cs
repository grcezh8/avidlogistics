using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Application.UseCases.ChainOfCustody;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScannedFormsController : ControllerBase
    {
        private readonly ScannedFormService _scannedFormService;
        private readonly ChainOfCustodyRepository _chainOfCustodyRepository;

        public ScannedFormsController(ScannedFormService sfService,
                                      ChainOfCustodyRepository chainRepo)
        {
            _scannedFormService = sfService;
            _chainOfCustodyRepository = chainRepo;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin,WarehouseStaff,Courier")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> UploadScannedForm([FromForm] UploadScannedFormRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "No file was uploaded." });

            using var memStream = new MemoryStream();
            await request.File.CopyToAsync(memStream);

            var scannedFormId = await _scannedFormService.UploadAsync(
                request.ElectionId,
                request.AssetId,
                request.FormType ?? "ChainOfCustody",
                memStream,
                request.File.FileName,
                request.UploadedBy,
                request.Description);

            return Ok(new { scannedFormId, message = "Form uploaded successfully" });
        }

        [HttpPost("finalize")]
        [Authorize(Roles = "Admin,WarehouseStaff,Courier")]
        public async Task<IActionResult> FinalizeCustodyEvent([FromBody] FinalizeCustodyEventDto dto)
        {
            var custodyEvent = new ChainOfCustodyEvent(
                dto.ElectionId,
                dto.AssetId,
                dto.FromParty,
                dto.ToParty,
                dto.SealNumber,
                dto.CreatedBy,
                dto.Notes,
                dto.ScannedFormId);

            var eventId = await _chainOfCustodyRepository.SaveAsync(custodyEvent);
            var createdEvent = await _chainOfCustodyRepository.GetByIdAsync(eventId);

            return CreatedAtAction("GetChainOfCustodyEvent", "ChainOfCustody", new { id = eventId }, createdEvent);
        }

        public class UploadScannedFormRequest
        {
            public IFormFile File { get; set; } = null!;
            public int ElectionId { get; set; }
            public int AssetId { get; set; }
            public string? FormType { get; set; }
            public int UploadedBy { get; set; }
            public string? Description { get; set; }
        }

        public class FinalizeCustodyEventDto
        {
            public int ElectionId { get; set; }
            public int AssetId { get; set; }
            public string FromParty { get; set; } = "";
            public string ToParty { get; set; } = "";
            public string? SealNumber { get; set; }
            public string? Notes { get; set; }
            public int? ScannedFormId { get; set; }
            public int CreatedBy { get; set; }
        }
    }
}
