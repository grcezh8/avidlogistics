using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.UseCases.Delivery
{
    public class ConfirmDeliveryUseCase
    {
        private readonly IDeliveryManifestRepository _manifestRepository;
        private readonly IAssetRepository _assetRepository;
        private readonly IKitRepository _kitRepository;
        private readonly IAVIDService _avidService;

        public ConfirmDeliveryUseCase(
            IDeliveryManifestRepository manifestRepository,
            IAssetRepository assetRepository,
            IKitRepository kitRepository,
            IAVIDService avidService)
        {
            _manifestRepository = manifestRepository;
            _assetRepository = assetRepository;
            _kitRepository = kitRepository;
            _avidService = avidService;
        }

        public async Task ExecuteAsync(ConfirmDeliveryInput input)
        {
            var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
            if (manifest == null)
                throw new ManifestNotFoundException($"Manifest {input.ManifestId} not found");

            manifest.ConfirmDelivery(input.Signature);
            await _manifestRepository.UpdateAsync(manifest);

            foreach (var kitId in manifest.KitIds)
            {
                var kit = await _kitRepository.GetByIdAsync(kitId);
                foreach (var assetId in kit.AssetIds)
                {
                    var asset = await _assetRepository.GetByIdAsync(assetId);
                    asset.ConfirmDelivery(input.Location);
                    await _assetRepository.UpdateAsync(asset);
                }
            }

            await _avidService.NotifyElectionStatusAsync(manifest.PollSiteId, "Assets Delivered");
        }
    }
}
