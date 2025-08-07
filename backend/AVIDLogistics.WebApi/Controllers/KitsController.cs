using Microsoft.AspNetCore.Mvc;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;

namespace AVIDLogistics.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KitsController : ControllerBase
    {
        private readonly IKitRepository _kitRepository;
        private readonly IAssetRepository _assetRepository;
        private readonly IPollSiteRepository _pollSiteRepository;

        public KitsController(
            IKitRepository kitRepository,
            IAssetRepository assetRepository,
            IPollSiteRepository pollSiteRepository)
        {
            _kitRepository = kitRepository;
            _assetRepository = assetRepository;
            _pollSiteRepository = pollSiteRepository;
        }

        /// <summary>
        /// Get packed kits
        /// </summary>
        [HttpGet("packed")]
        public async Task<IActionResult> GetPackedKits()
        {
            try
            {
                var kits = await _kitRepository.GetByStatusAsync(KitStatus.Packed);
                var kitSummaries = new List<KitSummaryDto>();

                foreach (var kit in kits)
                {
                    var kitSummary = new KitSummaryDto
                    {
                        KitId = kit.Id,
                        Name = kit.Name,
                        Type = kit.Type.ToString(),
                        Status = kit.Status.ToString(),
                        PollSiteId = kit.PollSiteId,
                        PollSiteName = kit.PollSiteId.HasValue ? $"Poll Site {kit.PollSiteId}" : null,
                        AssetCount = kit.AssetKits.Count(),
                        CreatedDate = kit.CreatedDate,
                        // TODO: Add manifest reference when we have the relationship
                        ManifestId = null,
                        ManifestNumber = null
                    };
                    kitSummaries.Add(kitSummary);
                }

                return Ok(kitSummaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get kit details with assets
        /// </summary>
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetKitDetails(int id)
        {
            try
            {
                var kit = await _kitRepository.GetByIdWithAssetsAsync(id);
                if (kit == null)
                {
                    return NotFound(new { message = "Kit not found" });
                }

                var kitAssets = new List<KitAssetDto>();
                foreach (var assetKit in kit.AssetKits)
                {
                    var asset = assetKit.Asset;
                    if (asset != null)
                    {
                        kitAssets.Add(new KitAssetDto
                        {
                            AssetId = asset.Id,
                            SerialNumber = asset.SerialNumber,
                            AssetType = asset.AssetType,
                            Status = asset.Status.ToString(),
                            SealNumber = null, // TODO: Get seal number from manifest item if needed
                            AssignedDate = assetKit.AssignedDate
                        });
                    }
                }

                var kitDetails = new KitWithAssetsDto
                {
                    KitId = kit.Id,
                    Name = kit.Name,
                    Type = kit.Type.ToString(),
                    Status = kit.Status.ToString(),
                    PollSiteId = kit.PollSiteId,
                    PollSiteName = kit.PollSiteId.HasValue ? $"Poll Site {kit.PollSiteId}" : null,
                    CreatedDate = kit.CreatedDate,
                    // TODO: Add manifest reference when we have the relationship
                    ManifestId = null,
                    ManifestNumber = null,
                    Assets = kitAssets
                };

                return Ok(kitDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all kits with optional status filter
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetKits([FromQuery] string? status = null)
        {
            try
            {
                IEnumerable<Kit> kits;
                
                if (!string.IsNullOrEmpty(status) &&
                    Enum.TryParse<KitStatus>(status, true, out var parsedStatus))
                {
                    kits = await _kitRepository.GetByStatusAsync(parsedStatus);
                }
                else
                {
                    kits = await _kitRepository.GetAllAsync();
                }

                var kitSummaries = new List<KitSummaryDto>();
                foreach (var kit in kits)
                {
                    var kitSummary = new KitSummaryDto
                    {
                        KitId = kit.Id,
                        Name = kit.Name,
                        Type = kit.Type.ToString(),
                        Status = kit.Status.ToString(),
                        PollSiteId = kit.PollSiteId,
                        PollSiteName = kit.PollSiteId.HasValue ? $"Poll Site {kit.PollSiteId}" : null,
                        AssetCount = kit.AssetKits.Count(),
                        CreatedDate = kit.CreatedDate,
                        ManifestId = null,
                        ManifestNumber = null
                    };
                    kitSummaries.Add(kitSummary);
                }

                return Ok(kitSummaries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
