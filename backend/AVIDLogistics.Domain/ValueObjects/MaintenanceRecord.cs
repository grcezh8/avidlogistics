using System;

namespace AVIDLogistics.Domain.ValueObjects
{
    public class MaintenanceRecord
    {
        public int Id { get; private set; }
        public DateTime Date { get; private set; }
        public int TechnicianId { get; private set; }
        public string WorkDescription { get; private set; }
        public string PartsUsed { get; private set; }

        // Parameterless constructor for EF Core
        private MaintenanceRecord() { }

        public MaintenanceRecord(int technicianId, string workDescription, string partsUsed = null)
        {
            Date = DateTime.UtcNow;
            TechnicianId = technicianId;
            WorkDescription = workDescription ?? throw new ArgumentNullException(nameof(workDescription));
            PartsUsed = partsUsed;
        }
    }
}
