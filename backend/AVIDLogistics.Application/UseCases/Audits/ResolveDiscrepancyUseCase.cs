using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class ResolveDiscrepancyUseCase
{
    private readonly IAuditSessionRepository _auditRepository;

    public ResolveDiscrepancyUseCase(IAuditSessionRepository auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task ExecuteAsync(int sessionId, int discrepancyId, string resolution)
    {
        var session = await _auditRepository.GetByIdAsync(sessionId);
        if (session == null)
            throw new AuditSessionNotFoundException($"Audit session {sessionId} not found");

        session.ResolveDiscrepancy(discrepancyId, resolution);
        await _auditRepository.UpdateAsync(session);
    }
}