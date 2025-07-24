using System;

namespace AVIDLogistics.Domain.ValueObjects
{
    public class AuditScanRecord
    {
        public int Id { get; private set; }
        public string Barcode { get; private set; }
        public string Location { get; private set; }
        public DateTime ScanTime { get; private set; }

        public AuditScanRecord(string barcode, string location)
        {
            Barcode = barcode ?? throw new ArgumentNullException(nameof(barcode));
            Location = location ?? throw new ArgumentNullException(nameof(location));
            ScanTime = DateTime.UtcNow;
        }
    }
}
