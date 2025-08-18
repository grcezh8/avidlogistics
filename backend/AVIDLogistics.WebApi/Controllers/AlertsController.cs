using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly IAlertsRepository _alertsRepository;

        public AlertsController(IAlertsRepository alertsRepository)
        {
            _alertsRepository = alertsRepository;
        }

        /// <summary>
        /// Get all alerts
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetAllAlerts()
        {
            try
            {
                var alerts = await _alertsRepository.GetAllAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get active alerts only
        /// </summary>
        [HttpGet("active")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetActiveAlerts()
        {
            try
            {
                var alerts = await _alertsRepository.GetActiveAlertsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving active alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get alerts by type
        /// </summary>
        [HttpGet("type/{alertType}")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetAlertsByType(AlertType alertType)
        {
            try
            {
                var alerts = await _alertsRepository.GetAlertsByTypeAsync(alertType);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving {alertType} alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get alerts by severity
        /// </summary>
        [HttpGet("severity/{severity}")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetAlertsBySeverity(AlertSeverity severity)
        {
            try
            {
                var alerts = await _alertsRepository.GetAlertsBySeverityAsync(severity);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving {severity} severity alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get alert by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<Alert>> GetAlert(int id)
        {
            try
            {
                var alert = await _alertsRepository.GetByIdAsync(id);
                if (alert == null)
                {
                    return NotFound(new { message = "Alert not found" });
                }
                return Ok(alert);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Create a new alert
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult<Alert>> CreateAlert([FromBody] Alert alert)
        {
            try
            {
                await _alertsRepository.AddAsync(alert);
                return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, alert);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Resolve an alert
        /// </summary>
        [HttpPut("{id}/resolve")]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult> ResolveAlert(int id, [FromBody] ResolveAlertRequest request)
        {
            try
            {
                await _alertsRepository.ResolveAlertAsync(id, request.ResolvedBy);
                return Ok(new { message = "Alert resolved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error resolving alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Dismiss an alert
        /// </summary>
        [HttpPut("{id}/dismiss")]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult> DismissAlert(int id)
        {
            try
            {
                await _alertsRepository.DismissAlertAsync(id);
                return Ok(new { message = "Alert dismissed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error dismissing alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Create delivery delay alert (for mobile app integration)
        /// </summary>
        [HttpPost("delivery-delay")]
        [Authorize(Roles = "Admin,WarehouseStaff,Driver")]
        public async Task<ActionResult> CreateDeliveryDelayAlert([FromBody] DeliveryDelayRequest request)
        {
            try
            {
                await _alertsRepository.CreateDeliveryDelayAlertAsync(
                    request.ManifestId, 
                    request.PollSiteName, 
                    request.DelayMinutes
                );
                return Ok(new { message = "Delivery delay alert created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating delivery delay alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Create pickup delay alert (for mobile app integration)
        /// </summary>
        [HttpPost("pickup-delay")]
        [Authorize(Roles = "Admin,WarehouseStaff,Driver")]
        public async Task<ActionResult> CreatePickupDelayAlert([FromBody] PickupDelayRequest request)
        {
            try
            {
                await _alertsRepository.CreatePickupDelayAlertAsync(
                    request.PollSiteId, 
                    request.PollSiteName, 
                    request.DelayMinutes
                );
                return Ok(new { message = "Pickup delay alert created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating pickup delay alert", error = ex.Message });
            }
        }

        /// <summary>
        /// Create missing asset alert
        /// </summary>
        [HttpPost("missing-asset")]
        [Authorize(Roles = "Admin,WarehouseStaff")]
        public async Task<ActionResult> CreateMissingAssetAlert([FromBody] MissingAssetRequest request)
        {
            try
            {
                await _alertsRepository.CreateMissingAssetAlertAsync(
                    request.AssetId, 
                    request.SerialNumber, 
                    request.HoursNotScanned
                );
                return Ok(new { message = "Missing asset alert created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating missing asset alert", error = ex.Message });
            }
        }

        // Legacy endpoints for backward compatibility
        /// <summary>
        /// Get missing seals alerts (legacy)
        /// </summary>
        [HttpGet("missing-seals")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetMissingSeals()
        {
            try
            {
                var alerts = await _alertsRepository.GetMissingSealsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving missing seals alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get overdue returns alerts (legacy)
        /// </summary>
        [HttpGet("overdue-returns")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetOverdueReturns()
        {
            try
            {
                var alerts = await _alertsRepository.GetOverdueReturnsAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving overdue returns alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get unresolved discrepancies alerts (legacy)
        /// </summary>
        [HttpGet("unresolved-discrepancies")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetUnresolvedDiscrepancies()
        {
            try
            {
                var alerts = await _alertsRepository.GetUnresolvedDiscrepanciesAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving unresolved discrepancies alerts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get assets needing maintenance alerts (legacy)
        /// </summary>
        [HttpGet("maintenance-needed")]
        [Authorize(Roles = "Admin,WarehouseStaff,Auditor")]
        public async Task<ActionResult<List<Alert>>> GetAssetsNeedingMaintenance()
        {
            try
            {
                var alerts = await _alertsRepository.GetAssetsNeedingMaintenanceAsync();
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving maintenance alerts", error = ex.Message });
            }
        }
    }

    // Request DTOs
    public class ResolveAlertRequest
    {
        public string ResolvedBy { get; set; } = string.Empty;
    }

    public class DeliveryDelayRequest
    {
        public int ManifestId { get; set; }
        public string PollSiteName { get; set; } = string.Empty;
        public int DelayMinutes { get; set; }
    }

    public class PickupDelayRequest
    {
        public int PollSiteId { get; set; }
        public string PollSiteName { get; set; } = string.Empty;
        public int DelayMinutes { get; set; }
    }

    public class MissingAssetRequest
    {
        public int AssetId { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public int HoursNotScanned { get; set; }
    }
}
