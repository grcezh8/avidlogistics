using System;
using System.Collections.Generic;

namespace AVIDLogistics.Application.DTOs
{
    public class CoCFormDto
    {
        public int ManifestId { get; set; }
        public string ManifestNumber { get; set; } = string.Empty;
        public string FormUrl { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int RequiredSignatures { get; set; }
        public int CompletedSignatures { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int AccessCount { get; set; }
        public string ElectionName { get; set; } = string.Empty;
        public string FromFacility { get; set; } = string.Empty;
        public string ToPollSite { get; set; } = string.Empty;
        public List<ManifestItemDto> Items { get; set; } = new();
        public List<SignatureDto> Signatures { get; set; } = new();
    }

    public class SignatureDto
    {
        public int SignatureId { get; set; }
        public string SignedBy { get; set; } = string.Empty;
        public DateTime SignedAt { get; set; }
        public string SignatureType { get; set; } = string.Empty;
        public bool IsValid { get; set; }
    }
}
