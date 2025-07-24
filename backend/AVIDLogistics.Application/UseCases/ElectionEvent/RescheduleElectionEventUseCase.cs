using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class RescheduleElectionEventUseCase
{
    private readonly IElectionEventRepository _electionEventRepository;
    private readonly INotificationGateway _notificationGateway;

    public RescheduleElectionEventUseCase(IElectionEventRepository electionEventRepository, INotificationGateway notificationGateway)
    {
        _electionEventRepository = electionEventRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int eventId, DateTime newEventDate)
    {
        var electionEvent = await _electionEventRepository.GetByIdAsync(eventId);
        if (electionEvent == null)
            throw new ElectionEventNotFoundException($"Election event {eventId} not found");

        var oldDate = electionEvent.EventDate;
        electionEvent.Reschedule(newEventDate);
        await _electionEventRepository.UpdateAsync(electionEvent);

        await _notificationGateway.NotifyLogisticsAsync(
            $"Election {electionEvent.Name} rescheduled from {oldDate:yyyy-MM-dd} to {newEventDate:yyyy-MM-dd}");
    }
}