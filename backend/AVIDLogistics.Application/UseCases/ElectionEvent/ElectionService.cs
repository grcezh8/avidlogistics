using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class ElectionService
{
    private readonly IElectionRepository _electionRepository;
    private readonly INotificationGateway _notificationGateway;

    public ElectionService(IElectionRepository electionRepository, INotificationGateway notificationGateway)
    {
        _electionRepository = electionRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task<int> CreateElectionAsync(CreateElectionInput input, int createdBy)
    {
        var election = new Election(input.Name, input.ElectionDate, input.ElectionType, createdBy);
        var electionId = await _electionRepository.SaveAsync(election);

        await _notificationGateway.NotifyWarehouseAsync($"New election created: {input.Name}");
        return electionId;
    }

    public async Task UpdateElectionStatusAsync(int electionId, ElectionStatus status, int modifiedBy)
    {
        var election = await _electionRepository.GetByIdAsync(electionId);
        if (election == null)
            throw new ElectionNotFoundException($"Election {electionId} not found");

        election.UpdateStatus(status, modifiedBy);
        await _electionRepository.UpdateAsync(election);
    }

    public async Task<List<Election>> GetUpcomingElectionsAsync()
    {
        return await _electionRepository.GetUpcomingAsync();
    }

    public async Task<Election> GetElectionByIdAsync(int electionId)
    {
        return await _electionRepository.GetByIdAsync(electionId);
    }
}