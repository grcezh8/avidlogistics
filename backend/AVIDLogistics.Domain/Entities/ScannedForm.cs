using System;

namespace AVIDLogistics.Domain.Entities
{
    public class ScannedForm
    {
        public int ScannedFormId { get; private set; }
        public string FileName { get; set; } = string.Empty;
        public string BlobUrl { get; set; } = string.Empty;
        public int ElectionId { get; private set; }
        public int AssetId { get; private set; }
        public string FormType { get; private set; }
        public string FilePath { get; private set; }
        public DateTime UploadedDate { get; private set; }
        public int UploadedBy { get; private set; }

        public ScannedForm(int electionId, int assetId, string formType, string filePath, int uploadedBy)
        {
            ElectionId = electionId;
            AssetId = assetId;
            FormType = formType ?? throw new ArgumentNullException(nameof(formType));
            FilePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
            UploadedBy = uploadedBy;
            UploadedDate = DateTime.UtcNow;
        }
    }
}
