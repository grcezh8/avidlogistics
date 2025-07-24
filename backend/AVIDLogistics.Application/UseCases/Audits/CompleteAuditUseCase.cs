using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CompleteAuditUseCase
{
    private readonly IAuditSessionRepository _auditRepository;
    private readonly INotificationGateway _notificationGateway;

    public CompleteAuditUseCase(IAuditSessionRepository auditRepository, INotificationGateway notificationGateway)
    {
        _auditRepository = auditRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(int sessionId)
    {
        var session = await _auditRepository.GetByIdAsync(sessionId);
        if (session == null)
            throw new AuditSessionNotFoundException($"Audit session {sessionId} not found");

        session.CompleteAudit();
        await _auditRepository.UpdateAsync(session);

        await _notificationGateway.NotifyWarehouseAsync(
            $"Audit session {session.SessionNumber} completed");
    }
}