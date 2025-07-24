using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class RecordAuditScanUseCase
{
    private readonly IAuditSessionRepository _auditRepository;
    private readonly IAssetRepository _assetRepository;

    public RecordAuditScanUseCase(
        IAuditSessionRepository auditRepository,
        IAssetRepository assetRepository)
    {
        _auditRepository = auditRepository;
        _assetRepository = assetRepository;
    }

    public async Task ExecuteAsync(RecordAuditScanInput input)
    {
        // Get audit session
        var session = await _auditRepository.GetByIdAsync(input.SessionId);
        if (session == null)
            throw new AuditSessionNotFoundException($"Audit session {input.SessionId} not found");

        // Record scan
        session.RecordScan(input.Barcode, input.Location);

        // Check for discrepancies
        var asset = await _assetRepository.GetByBarcodeAsync(input.Barcode);
        if (asset != null && asset.Location != input.Location)
        {
            session.AddDiscrepancy(asset.Id, asset.Location, input.Location,
                "Location mismatch during audit");
        }

        await _auditRepository.UpdateAsync(session);
    }
}