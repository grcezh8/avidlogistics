using System;

namespace AVIDLogistics.Domain.Entities
{
    public class CoCFormStatus
    {
        public int CoCFormStatusId { get; private set; }
        public int ManifestId { get; private set; }
        public string FormUrl { get; private set; }
        public string Status { get; private set; }
        public int RequiredSignatures { get; private set; }
        public int CompletedSignatures { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public DateTime? ExpiresAt { get; private set; }
        public DateTime? LastAccessedAt { get; private set; }
        public int AccessCount { get; private set; }

        // Navigation property
        public Manifest Manifest { get; private set; }

        // Parameterless constructor for EF Core
        private CoCFormStatus()
        {
        }

        public CoCFormStatus(
            int manifestId,
            string formUrl,
            int requiredSignatures = 2,
            DateTime? expiresAt = null)
        {
            ManifestId = manifestId;
            FormUrl = formUrl ?? throw new ArgumentNullException(nameof(formUrl));
            Status = "Generated";
            RequiredSignatures = requiredSignatures;
            CompletedSignatures = 0;
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(30); // Default 30 days expiration
            AccessCount = 0;
        }

        public void RecordAccess()
        {
            LastAccessedAt = DateTime.UtcNow;
            AccessCount++;
        }

        public void StartProgress()
        {
            if (Status == "Generated")
            {
                Status = "InProgress";
            }
        }

        public void AddSignature()
        {
            CompletedSignatures++;
            
            if (Status == "Generated")
            {
                Status = "InProgress";
            }

            if (CompletedSignatures >= RequiredSignatures)
            {
                Status = "Completed";
                CompletedAt = DateTime.UtcNow;
            }
        }

        public void MarkAsExpired()
        {
            if (Status != "Completed")
            {
                Status = "Expired";
            }
        }

        public bool IsExpired()
        {
            return ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value && Status != "Completed";
        }

        public bool IsCompleted()
        {
            return Status == "Completed";
        }

        public void ExtendExpiration(DateTime newExpirationDate)
        {
            if (Status != "Completed")
            {
                ExpiresAt = newExpirationDate;
            }
        }
    }
}
