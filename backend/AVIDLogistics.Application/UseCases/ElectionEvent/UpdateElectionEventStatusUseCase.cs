using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdateElectionEventStatusUseCase
{
    private readonly IElectionEventRepository _electionEventRepository;

    public UpdateElectionEventStatusUseCase(IElectionEventRepository electionEventRepository)
    {
        _electionEventRepository = electionEventRepository;
    }

    public async Task ExecuteAsync(int eventId, ElectionStatus newStatus)
    {
        var electionEvent = await _electionEventRepository.GetByIdAsync(eventId);
        if (electionEvent == null)
            throw new ElectionEventNotFoundException($"Election event {eventId} not found");

        electionEvent.UpdateStatus(newStatus);
        await _electionEventRepository.UpdateAsync(electionEvent);
    }
}