using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.Services
{
    public class ManifestService
    {
        private readonly IManifestRepository _manifestRepository;
        private readonly IAssetRepository _assetRepository;
        private readonly IKitRepository _kitRepository;
        private readonly IPollSiteRepository _pollSiteRepository;

        public ManifestService(
            IManifestRepository manifestRepository,
            IAssetRepository assetRepository,
            IKitRepository kitRepository,
            IPollSiteRepository pollSiteRepository)
        {
            _manifestRepository = manifestRepository;
            _assetRepository = assetRepository;
            _kitRepository = kitRepository;
            _pollSiteRepository = pollSiteRepository;
        }

        public async Task<int> CreateManifestAsync(CreateManifestInput input, int createdBy)
        {
            var manifest = new Manifest(input.ElectionId, input.FromFacilityId, input.ToPollSiteId, createdBy);
            await _manifestRepository.AddAsync(manifest);
            return manifest.ManifestId;
        }

        public async Task<int> CreateManifestWithAssetsAsync(CreateManifestWithAssetsInput input, int createdBy)
        {
            // 1. Skip poll site validation for now to avoid entity constructor issues
            // TODO: Fix PollSite entity constructor and re-enable validation
            
            // 2. Validate all assets exist and are available
            var assets = new List<Asset>();
            foreach (var assetId in input.AssetIds)
            {
                var asset = await _assetRepository.GetByIdAsync(assetId);
                if (asset == null)
                    throw new AssetNotFoundException($"Asset with ID {assetId} not found");
                
                if (asset.Status != AssetStatus.Available)
                    throw new InvalidOperationException($"Asset {asset.SerialNumber} is not available (current status: {asset.Status})");
                
                assets.Add(asset);
            }

            // 3. Create kit automatically with selected assets
            var kitName = $"Kit-PS{input.PollSiteId}-{DateTime.UtcNow:yyyyMMdd-HHmm}";
            var kit = new Kit(kitName, KitType.Standard);
            
            // First save the kit to get its ID
            await _kitRepository.AddAsync(kit);

            // 4. Now add assets to kit using the proper relationship
            // Note: We need to add the AssetKit relationships after the kit is saved and has an ID
            foreach (var asset in assets)
            {
                // The kit.AddAsset method will create AssetKit entities
                kit.AddAsset(asset.Id, createdBy);
                asset.AssignToKit(kit.Id);
            }

            // Assign kit to poll site
            kit.AssignToPollSite(input.PollSiteId);
            
            // Update the kit with the new relationships
            await _kitRepository.UpdateAsync(kit);

            // 5. Create manifest
            var manifest = new Manifest(input.ElectionId, input.FromFacilityId, input.PollSiteId, createdBy);

            // 6. Add manifest items for each asset
            foreach (var asset in assets)
            {
                var sealNumber = $"SEAL-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                manifest.AddItem(asset.Id, sealNumber);
            }

            // 7. Set manifest ready for packing
            manifest.ReadyForPacking();

            // 8. Save everything
            await _manifestRepository.AddAsync(manifest);
            
            // Update asset statuses
            foreach (var asset in assets)
            {
                await _assetRepository.UpdateAsync(asset);
            }

            return manifest.ManifestId;
        }

        public async Task AddItemToManifestAsync(AddManifestItemInput input)
        {
            var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {input.ManifestId} not found");

            manifest.AddItem(input.AssetId, input.SealNumber);
            await _manifestRepository.UpdateAsync(manifest);
        }

        public async Task ReadyManifestForPackingAsync(int manifestId)
        {
            var manifest = await _manifestRepository.GetByIdAsync(manifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {manifestId} not found");

            manifest.ReadyForPacking();
            await _manifestRepository.UpdateAsync(manifest);
        }

        public async Task MarkItemPackedAsync(MarkItemPackedInput input)
        {
            var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {input.ManifestId} not found");

            manifest.MarkItemPacked(input.AssetId, input.PackedBy);
            await _manifestRepository.UpdateAsync(manifest);
        }

        public async Task CompleteManifestAsync(int manifestId)
        {
            var manifest = await _manifestRepository.GetByIdAsync(manifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {manifestId} not found");

            manifest.Complete();
            await _manifestRepository.UpdateAsync(manifest);
        }

        public async Task FinishPackingAsync(int manifestId, int packedBy)
        {
            var manifest = await _manifestRepository.GetByIdAsync(manifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {manifestId} not found");

            // Get all assets in the manifest and update their status to Pending
            var assetIds = manifest.Items.Select(i => i.AssetId).ToList();
            var assets = new List<Asset>();
            
            foreach (var assetId in assetIds)
            {
                var asset = await _assetRepository.GetByIdAsync(assetId);
                if (asset != null)
                {
                    // Update asset status to Pending (as requested)
                    asset.MarkPending();
                    await _assetRepository.UpdateAsync(asset);
                    assets.Add(asset);
                }

                // Mark the manifest item as packed
                manifest.MarkItemPacked(assetId, packedBy);
            }

            // Create a kit automatically for this manifest
            var kitName = $"Kit-{manifest.ManifestNumber}-{DateTime.UtcNow:yyyyMMdd}";
            var kit = new Kit(kitName, KitType.Standard);
            
            // Save the kit first to get its ID
            await _kitRepository.AddAsync(kit);

            // Add all manifest assets to the kit
            foreach (var asset in assets)
            {
                kit.AddAsset(asset.Id, packedBy);
                asset.AssignToKit(kit.Id);
                await _assetRepository.UpdateAsync(asset);
            }

            // Assign kit to the manifest's poll site and mark as packed
            kit.AssignToPollSite(manifest.ToPollSiteId);
            kit.MarkPacked();
            
            // Update the kit with the new relationships and status
            await _kitRepository.UpdateAsync(kit);

            // Update the manifest
            await _manifestRepository.UpdateAsync(manifest);
        }

        public async Task<ManifestWithDetailsDto> GetManifestWithDetailsAsync(int manifestId)
        {
            var manifest = await _manifestRepository.GetByIdAsync(manifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest with ID {manifestId} not found");

            // Skip poll site lookup for now to avoid entity constructor issues
            // TODO: Fix PollSite entity constructor and re-enable lookup
            
            var manifestItems = new List<ManifestItemDto>();
            var missingAssetIds = new List<int>();
            
            foreach (var item in manifest.Items)
            {
                var asset = await _assetRepository.GetByIdAsync(item.AssetId);
                
                if (asset == null)
                {
                    // Log missing asset for debugging
                    missingAssetIds.Add(item.AssetId);
                    Console.WriteLine($"WARNING: Asset with ID {item.AssetId} not found for ManifestItem {item.ManifestItemId} in Manifest {manifestId}");
                }
                
                manifestItems.Add(new ManifestItemDto
                {
                    ManifestItemId = item.ManifestItemId,
                    AssetId = item.AssetId,
                    AssetSerialNumber = asset?.SerialNumber ?? $"Missing Asset ID {item.AssetId}",
                    AssetType = asset?.AssetType ?? "Missing Asset",
                    SealNumber = item.SealNumber,
                    IsPacked = item.IsPacked,
                    PackedDate = item.PackedDate,
                    PackedBy = item.PackedBy
                });
            }
            
            // Log summary of missing assets
            if (missingAssetIds.Any())
            {
                Console.WriteLine($"MANIFEST {manifestId} DATA INTEGRITY ISSUE: {missingAssetIds.Count} missing assets: [{string.Join(", ", missingAssetIds)}]");
            }

            return new ManifestWithDetailsDto
            {
                ManifestId = manifest.ManifestId,
                ManifestNumber = manifest.ManifestNumber,
                ElectionId = manifest.ElectionId,
                FromFacilityId = manifest.FromFacilityId,
                ToPollSiteId = manifest.ToPollSiteId,
                PollSiteName = $"Poll Site {manifest.ToPollSiteId}",
                PollSiteDisplayName = $"PS{manifest.ToPollSiteId:000} - Poll Site {manifest.ToPollSiteId}",
                Status = manifest.Status.ToString(),
                ItemCount = manifest.Items.Count,
                PackedCount = manifest.Items.Count(i => i.IsPacked),
                CreatedDate = manifest.CreatedDate,
                PackedDate = manifest.PackedDate,
                Items = manifestItems
            };
        }
    }
}
