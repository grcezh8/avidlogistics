using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;

namespace AVIDLogistics.Application.UseCases.ElectionEvents
{
    public class CreateElectionEventUseCase
    {
        private readonly IElectionEventRepository _electionEventRepository;
        private readonly INotificationGateway _notificationGateway;

        public CreateElectionEventUseCase(
            IElectionEventRepository electionEventRepository,
            INotificationGateway notificationGateway)
        {
            _electionEventRepository = electionEventRepository;
            _notificationGateway = notificationGateway;
        }

        public async Task<int> ExecuteAsync(CreateElectionEventInput input, int createdBy)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(input.Name))
                throw new ArgumentException("Event name is required");

            if (input.EventDate <= DateTime.UtcNow)
                throw new ArgumentException("Event date must be in the future");

            // Create election event
            var electionEvent = new Domain.Entities.ElectionEvent(input.Name, input.EventDate,
                input.EventType, input.MapId, createdBy);

            // Save event
            await _electionEventRepository.AddAsync(electionEvent);

            // Notify logistics
            await _notificationGateway.NotifyLogisticsAsync(
                $"New election event created: {input.Name} on {input.EventDate:yyyy-MM-dd}");

            return 1; // TODO: Return actual ID from repository
        }
    }
}
