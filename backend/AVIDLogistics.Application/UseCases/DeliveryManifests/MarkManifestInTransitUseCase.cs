using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class MarkManifestInTransitUseCase
{
    private readonly IDeliveryManifestRepository _manifestRepository;
    private readonly INotificationGateway _notificationGateway;

    public MarkManifestInTransitUseCase(IDeliveryManifestRepository manifestRepository, INotificationGateway notificationGateway)
    {
        _manifestRepository = manifestRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int manifestId)
    {
        var manifest = await _manifestRepository.GetByIdAsync(manifestId);
        if (manifest == null)
            throw new ManifestNotFoundException($"Manifest {manifestId} not found");

        manifest.MarkInTransit();
        await _manifestRepository.UpdateAsync(manifest);

        await _notificationGateway.NotifyLogisticsAsync(
            $"Manifest {manifest.ManifestNumber} is now in transit");
    }
}