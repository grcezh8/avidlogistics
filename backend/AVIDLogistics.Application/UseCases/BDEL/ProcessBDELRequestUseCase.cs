using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class ProcessBDELRequestUseCase
{
    private readonly IBDELRequestRepository _bdelRequestRepository;
    private readonly INotificationGateway _notificationGateway;

    public ProcessBDELRequestUseCase(
        IBDELRequestRepository bdelRequestRepository,
        INotificationGateway notificationGateway)
    {
        _bdelRequestRepository = bdelRequestRepository;
        _notificationGateway = notificationGateway;
    }

    public async Task ExecuteAsync(ProcessBDELRequestInput input)
    {
        // Get request
        var request = await _bdelRequestRepository.GetByIdAsync(input.RequestId);
        if (request == null)
            throw new BDELRequestNotFoundException($"BDEL request {input.RequestId} not found");

        // Process request
        if (input.Approve)
        {
            request.Approve(input.AdminDecisionId);
            await _notificationGateway.NotifyLogisticsAsync(
                $"BDEL request {request.RequestNumber} approved");
        }
        else
        {
            request.Reject(input.AdminDecisionId);
            await _notificationGateway.NotifyLogisticsAsync(
                $"BDEL request {request.RequestNumber} rejected");
        }

        await _bdelRequestRepository.UpdateAsync(request);
    }
}