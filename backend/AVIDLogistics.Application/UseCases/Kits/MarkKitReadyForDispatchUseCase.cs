using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class MarkKitReadyForDispatchUseCase
{
    private readonly IKitRepository _kitRepository;

    public MarkKitReadyForDispatchUseCase(IKitRepository kitRepository)
    {
        _kitRepository = kitRepository;
    }

    public async Task ExecuteAsync(int kitId)
    {
        var kit = await _kitRepository.GetByIdAsync(kitId);
        if (kit == null)
            throw new KitNotFoundException($"Kit {kitId} not found");

        kit.MarkReadyForDispatch();
        await _kitRepository.UpdateAsync(kit);
    }
}