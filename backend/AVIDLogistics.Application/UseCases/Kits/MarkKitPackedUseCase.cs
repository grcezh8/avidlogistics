using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class MarkKitPackedUseCase
{
    private readonly IKitRepository _kitRepository;

    public MarkKitPackedUseCase(IKitRepository kitRepository)
    {
        _kitRepository = kitRepository;
    }

    public async Task ExecuteAsync(int kitId)
    {
        var kit = await _kitRepository.GetByIdAsync(kitId);
        if (kit == null)
            throw new KitNotFoundException($"Kit {kitId} not found");

        kit.MarkPacked();
        await _kitRepository.UpdateAsync(kit);
    }
}
