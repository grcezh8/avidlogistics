using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
using System.Data.Common;
public class StartAuditUseCase
{
    private readonly IAuditSessionRepository _auditRepository;

    public StartAuditUseCase(IAuditSessionRepository auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task<int> ExecuteAsync(StartAuditInput input)
    {
        var session = new AuditSession(input.AuditorId, input.Location);
        int id = await _auditRepository.SaveAsync(session);
        return id;
    }
}