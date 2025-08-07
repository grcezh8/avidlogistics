using System;

namespace AVIDLogistics.Domain.Entities
{
    public class Signature
    {
        public int SignatureId { get; private set; }
        public int ChainOfCustodyEventId { get; private set; }
        public string SignedBy { get; private set; }
        public string SignatureImageUrl { get; private set; }
        public DateTime SignedAt { get; private set; }
        public string SignatureType { get; private set; }
        public string IpAddress { get; private set; }
        public string UserAgent { get; private set; }
        public bool IsValid { get; private set; }

        // Navigation property
        public ChainOfCustodyEvent ChainOfCustodyEvent { get; private set; }

        // Parameterless constructor for EF Core
        private Signature()
        {
        }

        public Signature(
            int chainOfCustodyEventId,
            string signedBy,
            string signatureType = "Digital",
            string signatureImageUrl = null,
            string ipAddress = null,
            string userAgent = null)
        {
            ChainOfCustodyEventId = chainOfCustodyEventId;
            SignedBy = signedBy ?? throw new ArgumentNullException(nameof(signedBy));
            SignatureType = signatureType ?? "Digital";
            SignatureImageUrl = signatureImageUrl;
            IpAddress = ipAddress;
            UserAgent = userAgent;
            SignedAt = DateTime.UtcNow;
            IsValid = true;
        }

        public void MarkAsInvalid()
        {
            IsValid = false;
        }

        public void UpdateSignatureImage(string imageUrl)
        {
            SignatureImageUrl = imageUrl ?? throw new ArgumentNullException(nameof(imageUrl));
        }
    }
}
