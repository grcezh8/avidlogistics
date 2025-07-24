using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Application.UseCases;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly AlertsService _alertsService;

        public AlertsController(AlertsService alertsService)
        {
            _alertsService = alertsService;
        }

        /// <summary>
        /// Get missing seals alerts
        /// </summary>
        [HttpGet("missing-seals")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<MissingSealAlert>>> GetMissingSeals()
        {
            try
            {
                var alerts = await _alertsService.GetMissingSealsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving missing seals alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get overdue returns alerts
        /// </summary>
        [HttpGet("overdue-returns")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<OverdueReturnAlert>>> GetOverdueReturns()
        {
            try
            {
                var alerts = await _alertsService.GetOverdueReturnsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving overdue returns alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get unresolved discrepancies alerts
        /// </summary>
        [HttpGet("unresolved-discrepancies")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<DiscrepancyAlert>>> GetUnresolvedDiscrepancies()
        {
            try
            {
                var alerts = await _alertsService.GetUnresolvedDiscrepanciesAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unresolved discrepancies alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get assets needing maintenance alerts
        /// </summary>
        [HttpGet("maintenance-needed")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<AssetMaintenanceAlert>>> GetAssetsNeedingMaintenance()
        {
            try
            {
                var alerts = await _alertsService.GetAssetsNeedingMaintenanceAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving maintenance alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Process all alerts and send notifications
        /// </summary>
        [HttpPost("process")]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult> ProcessAlerts()
        {
            try
            {
                await _alertsService.ProcessAlertsAsync();
                return Ok(new { message = "Alerts processed and notifications sent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing alerts", error = ex.Message });
            }
        }
    }
}
