using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.UseCases.Delivery
{
    public class CreateDeliveryManifestUseCase
    {
        private readonly IDeliveryManifestRepository _manifestRepository;
        private readonly IKitRepository _kitRepository;

        public CreateDeliveryManifestUseCase(
            IDeliveryManifestRepository manifestRepository,
            IKitRepository kitRepository)
        {
            _manifestRepository = manifestRepository;
            _kitRepository = kitRepository;
        }

        public async Task<int> ExecuteAsync(CreateDeliveryManifestInput input)
        {
            // Validate all kits
            foreach (var kitId in input.KitIds)
            {
                var kit = await _kitRepository.GetByIdAsync(kitId);
                if (kit == null)
                    throw new KitNotFoundException($"Kit {kitId} not found");

                if (kit.Status != KitStatus.ReadyForDispatch)
                    throw new InvalidKitStateException($"Kit {kitId} is not ready for dispatch");

                if (kit.PollSiteId != input.PollSiteId)
                    throw new InvalidOperationException($"Kit {kitId} is not assigned to poll site {input.PollSiteId}");
            }

            // Create manifest
            var manifest = new DeliveryManifest(input.PollSiteId);

            // Add kits
            foreach (var kitId in input.KitIds)
            {
                manifest.AddKit(kitId);
            }

            await _manifestRepository.AddAsync(manifest);

            return manifest.Id;
        }
    }
}
