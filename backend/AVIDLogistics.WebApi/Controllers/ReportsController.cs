using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Application.UseCases;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ReportingService _reportingService;

        public ReportsController(ReportingService reportingService)
        {
            _reportingService = reportingService;
        }

        /// <summary>
        /// Get inventory status report by facility
        /// </summary>
        [HttpGet("inventory-status")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<InventoryStatusReport>>> GetInventoryStatus([FromQuery] int? facilityId = null)
        {
            try
            {
                var report = await _reportingService.GetInventoryStatusAsync(facilityId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating inventory status report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get seal usage report by election
        /// </summary>
        [HttpGet("seal-usage")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<SealUsageReport>>> GetSealUsage([FromQuery] int? electionId = null)
        {
            try
            {
                var report = await _reportingService.GetSealUsageAsync(electionId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating seal usage report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get chain of custody log
        /// </summary>
        [HttpGet("custody-log")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<ChainOfCustodyReport>>> GetChainOfCustodyLog(
            [FromQuery] int? electionId = null, 
            [FromQuery] int? assetId = null)
        {
            try
            {
                var report = await _reportingService.GetChainOfCustodyLogAsync(electionId, assetId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating chain of custody report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get asset status report
        /// </summary>
        [HttpGet("asset-status")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<AssetStatusReport>>> GetAssetStatusReport([FromQuery] int? facilityId = null)
        {
            try
            {
                var report = await _reportingService.GetAssetStatusReportAsync(facilityId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating asset status report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get manifest status report
        /// </summary>
        [HttpGet("manifest-status")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<ManifestStatusReport>>> GetManifestStatusReport([FromQuery] int? electionId = null)
        {
            try
            {
                var report = await _reportingService.GetManifestStatusReportAsync(electionId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating manifest status report", error = ex.Message });
            }
        }
    }
}
