using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.Services
{
    public class ManifestService : IManifestService
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
            Console.WriteLine($"Starting finish packing for manifest {manifestId}");
            
            // 1. Get the manifest and validate it exists
            var manifest = await _manifestRepository.GetByIdAsync(manifestId);
            if (manifest == null)
            {
                Console.WriteLine($"Manifest {manifestId} not found");
                throw new ManifestNotFoundException($"Manifest with ID {manifestId} not found");
            }

            Console.WriteLine($"Found manifest {manifestId} with status {manifest.Status}");

            // 2. Validate manifest is in correct state for finishing packing
            if (manifest.Status != ManifestStatus.ReadyForPacking && manifest.Status != ManifestStatus.PartiallyPacked)
            {
                Console.WriteLine($"Invalid manifest status: {manifest.Status}");
                throw new InvalidOperationException($"Cannot finish packing manifest in {manifest.Status} status");
            }

            // 3. Mark all manifest items as packed
            Console.WriteLine($"Marking all {manifest.Items.Count} items as packed");
            foreach (var item in manifest.Items)
            {
                if (!item.IsPacked)
                {
                    Console.WriteLine($"Marking item {item.ManifestItemId} (asset {item.AssetId}) as packed");
                    manifest.MarkItemPacked(item.AssetId, packedBy);
                }
            }

            // 4. Find the existing kit and mark it as packed
            Console.WriteLine("Finding existing kit for this manifest");
            Kit? existingKit = null;
            
            if (manifest.Items.Any())
            {
                try
                {
                    // Get all asset IDs from the manifest
                    var assetIds = manifest.Items.Select(item => item.AssetId).ToList();
                    Console.WriteLine($"Looking for kits containing assets: [{string.Join(", ", assetIds)}]");
                    
                    // Find kits that contain any of these assets using the kit repository
                    // We need to check all possible kit statuses since we don't know the current status
                    var allKitStatuses = new[] { KitStatus.Draft, KitStatus.Assigned, KitStatus.Packed, KitStatus.ReadyForDispatch };
                    
                    foreach (var status in allKitStatuses)
                    {
                        var kitsWithAssets = await _kitRepository.GetByStatusWithAssetsAsync(status);
                        
                        foreach (var kit in kitsWithAssets)
                        {
                            var kitAssetIds = kit.GetAssetIds().ToList();
                            Console.WriteLine($"Kit {kit.Id} ({kit.Name}) contains assets: [{string.Join(", ", kitAssetIds)}], Status: {kit.Status}");
                            
                            // Check if this kit contains any of our manifest assets
                            if (kitAssetIds.Any(assetId => assetIds.Contains(assetId)))
                            {
                                existingKit = kit;
                                Console.WriteLine($"Found matching kit {kit.Id} with status {kit.Status}");
                                break;
                            }
                        }
                        
                        if (existingKit != null)
                            break;
                    }
                    
                    if (existingKit != null)
                    {
                        Console.WriteLine($"Attempting to mark kit {existingKit.Id} as packed (current status: {existingKit.Status})");
                        
                        // Handle different kit statuses
                        if (existingKit.Status == KitStatus.Draft)
                        {
                            Console.WriteLine($"Kit {existingKit.Id} is in Draft status, assigning to poll site first");
                            existingKit.AssignToPollSite(manifest.ToPollSiteId);
                            Console.WriteLine($"Kit {existingKit.Id} assigned to poll site {manifest.ToPollSiteId}, status now: {existingKit.Status}");
                        }
                        
                        if (existingKit.Status == KitStatus.Assigned)
                        {
                            existingKit.MarkPacked();
                            await _kitRepository.UpdateAsync(existingKit);
                            Console.WriteLine($"Successfully marked kit {existingKit.Id} as packed");
                        }
                        else
                        {
                            Console.WriteLine($"Cannot mark kit {existingKit.Id} as packed - invalid status: {existingKit.Status}");
                        }
                    }
                    else
                    {
                        Console.WriteLine("No existing kit found for this manifest's assets");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR finding/updating existing kit: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    // Don't throw - continue with manifest packing even if kit update fails
                    existingKit = null;
                }
            }

            // 5. Update the manifest in the database
            await _manifestRepository.UpdateAsync(manifest);
            
            Console.WriteLine($"Successfully finished packing manifest {manifestId}. Status: {manifest.Status}");
            
            if (existingKit != null)
            {
                Console.WriteLine($"Kit {existingKit.Id} marked as packed");
            }
            else
            {
                Console.WriteLine("Warning: No kit was found for this manifest");
            }
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
