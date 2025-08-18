using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Domain.Entities
{
    public class Alert
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public AlertType AlertType { get; set; }
        public AlertSeverity Severity { get; set; }
        public AlertStatus Status { get; set; } = AlertStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        public string? ResolvedBy { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int Priority { get; set; } = 1;
        public string? AdditionalData { get; set; }
    }
}
