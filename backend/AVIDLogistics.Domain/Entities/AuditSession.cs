using System;
using System.Collections.Generic;
using System.Linq;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
using AVIDLogistics.Domain.ValueObjects;

namespace AVIDLogistics.Domain.Entities
{
    public class AuditSession
    {
        private readonly List<AuditScanRecord> _scanRecords = new();
        private readonly List<DiscrepancyRecord> _discrepancies = new();

        public int Id { get; private set; }
        public string SessionNumber { get; private set; }
        public int AuditorId { get; private set; }
        public string Location { get; private set; }
        public AuditStatus Status { get; private set; }
        public DateTime StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }
        public IReadOnlyList<AuditScanRecord> ScanRecords => _scanRecords.AsReadOnly();
        public IReadOnlyList<DiscrepancyRecord> Discrepancies => _discrepancies.AsReadOnly();

        // Parameterless constructor for Entity Framework
        protected AuditSession() { }

        public AuditSession(int auditorId, string location)
        {
            AuditorId = auditorId;
            Location = location ?? throw new ArgumentNullException(nameof(location));
            Status = AuditStatus.Initiated;
            StartDate = DateTime.UtcNow;
            SessionNumber = $"AUD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        public void RecordScan(string barcode, string location)
        {
            if (Status == AuditStatus.Approved)
                throw new InvalidAuditStateException("Cannot record scans in approved audit");

            var scanRecord = new AuditScanRecord(barcode, location);
            _scanRecords.Add(scanRecord);

            if (Status == AuditStatus.Initiated)
                Status = AuditStatus.Scanning;
        }

        public void AddDiscrepancy(int assetId, string expectedLocation, string actualLocation, string notes)
        {
            if (Status == AuditStatus.Approved)
                throw new InvalidAuditStateException("Cannot add discrepancies to approved audit");

            var discrepancy = new DiscrepancyRecord(assetId, expectedLocation, actualLocation, notes);
            _discrepancies.Add(discrepancy);
            Status = AuditStatus.DiscrepanciesFound;
        }

        public void ResolveDiscrepancy(int discrepancyId, string resolution)
        {
            var discrepancy = _discrepancies.FirstOrDefault(d => d.Id == discrepancyId);
            if (discrepancy == null)
                throw new ArgumentException("Discrepancy not found");

            discrepancy.Resolve(resolution);

            if (_discrepancies.All(d => d.IsResolved))
                Status = AuditStatus.Reconciled;
        }

        public void CompleteAudit()
        {
            if (Status == AuditStatus.DiscrepanciesFound && _discrepancies.Any(d => !d.IsResolved))
                throw new InvalidAuditStateException("Cannot complete audit with unresolved discrepancies");

            Status = AuditStatus.Approved;
            EndDate = DateTime.UtcNow;
        }
    }
}
