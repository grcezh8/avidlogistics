using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ICoCFormStatusRepository _cocFormStatusRepository;
        private readonly IChainOfCustodyRepository _chainOfCustodyRepository;
        private readonly IManifestRepository _manifestRepository;

        public ReportsController(
            ICoCFormStatusRepository cocFormStatusRepository,
            IChainOfCustodyRepository chainOfCustodyRepository,
            IManifestRepository manifestRepository)
        {
            _cocFormStatusRepository = cocFormStatusRepository;
            _chainOfCustodyRepository = chainOfCustodyRepository;
            _manifestRepository = manifestRepository;
        }

        /// <summary>
        /// Get daily status report of current custody states
        /// </summary>
        [HttpGet("daily-status")]
        public async Task<IActionResult> GetDailyStatusReport()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);

                // Get today's CoC forms
                var allForms = await _cocFormStatusRepository.GetAllAsync();
                var todaysForms = allForms.Where(f => f.CreatedAt.Date == today).ToList();

                // Get unresolved forms
                var unresolvedForms = await _cocFormStatusRepository.GetUnresolvedFormsAsync();

                // Get expired forms
                var expiredForms = await _cocFormStatusRepository.GetExpiredFormsAsync();

                // Get today's custody events
                var allEvents = await _chainOfCustodyRepository.GetAllAsync();
                var todaysEvents = allEvents.Where(e => e.DateTime.Date == today).ToList();

                var report = new
                {
                    reportDate = today.ToString("yyyy-MM-dd"),
                    generatedAt = DateTime.UtcNow,
                    cocForms = new
                    {
                        totalGenerated = todaysForms.Count,
                        completed = todaysForms.Count(f => f.Status == "Completed"),
                        inProgress = todaysForms.Count(f => f.Status == "InProgress"),
                        expired = expiredForms.Count(),
                        unresolved = unresolvedForms.Count()
                    },
                    custodyEvents = new
                    {
                        totalEvents = todaysEvents.Count,
                        packed = todaysEvents.Count(e => e.EventType == "Packed"),
                        shipped = todaysEvents.Count(e => e.EventType == "Shipped"),
                        delivered = todaysEvents.Count(e => e.EventType == "Delivered"),
                        transfers = todaysEvents.Count(e => e.EventType == "Transfer")
                    },
                    alerts = new
                    {
                        overdueSignatures = unresolvedForms.Count(f => f.ExpiresAt.HasValue && f.ExpiresAt.Value < DateTime.UtcNow),
                        expiredForms = expiredForms.Count(),
                        incompleteTransfers = unresolvedForms.Count(f => f.CompletedSignatures < f.RequiredSignatures)
                    }
                };

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get CoC completion statistics
        /// </summary>
        [HttpGet("coc-statistics")]
        public async Task<IActionResult> GetCoCStatistics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddDays(-30);
                var end = endDate ?? DateTime.UtcNow;

                var allForms = await _cocFormStatusRepository.GetAllAsync();
                var filteredForms = allForms.Where(f => f.CreatedAt >= start && f.CreatedAt <= end).ToList();

                var statistics = new
                {
                    period = new { start = start.ToString("yyyy-MM-dd"), end = end.ToString("yyyy-MM-dd") },
                    totalForms = filteredForms.Count,
                    completedForms = filteredForms.Count(f => f.Status == "Completed"),
                    averageCompletionTime = filteredForms
                        .Where(f => f.CompletedAt.HasValue)
                        .Select(f => (f.CompletedAt.Value - f.CreatedAt).TotalHours)
                        .DefaultIfEmpty(0)
                        .Average(),
                    completionRate = filteredForms.Count > 0 
                        ? (double)filteredForms.Count(f => f.Status == "Completed") / filteredForms.Count * 100 
                        : 0,
                    statusBreakdown = filteredForms
                        .GroupBy(f => f.Status)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    dailyTrends = filteredForms
                        .GroupBy(f => f.CreatedAt.Date)
                        .OrderBy(g => g.Key)
                        .Select(g => new { date = g.Key.ToString("yyyy-MM-dd"), count = g.Count() })
                        .ToList()
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get asset custody summary report
        /// </summary>
        [HttpGet("asset-custody-summary")]
        public async Task<IActionResult> GetAssetCustodySummary()
        {
            try
            {
                var allEvents = await _chainOfCustodyRepository.GetAllAsync();
                var recentEvents = allEvents.Where(e => e.DateTime >= DateTime.UtcNow.AddDays(-7)).ToList();

                var summary = new
                {
                    totalAssets = allEvents.Select(e => e.AssetId).Distinct().Count(),
                    recentTransfers = recentEvents.Count,
                    assetsInTransit = recentEvents
                        .Where(e => e.EventType == "Shipped" || e.EventType == "InTransit")
                        .Select(e => e.AssetId)
                        .Distinct()
                        .Count(),
                    assetsDelivered = recentEvents
                        .Where(e => e.EventType == "Delivered")
                        .Select(e => e.AssetId)
                        .Distinct()
                        .Count(),
                    topTransferRoutes = allEvents
                        .GroupBy(e => new { e.FromOrg, e.ToOrg })
                        .Where(g => !string.IsNullOrEmpty(g.Key.FromOrg) && !string.IsNullOrEmpty(g.Key.ToOrg))
                        .OrderByDescending(g => g.Count())
                        .Take(5)
                        .Select(g => new { 
                            route = $"{g.Key.FromOrg} → {g.Key.ToOrg}", 
                            count = g.Count() 
                        })
                        .ToList()
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
