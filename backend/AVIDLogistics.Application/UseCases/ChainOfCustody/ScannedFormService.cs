using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.UseCases.ChainOfCustody
{
    public class ScannedFormService
    {
        private readonly IScannedFormRepository _scannedFormRepository;

        public ScannedFormService(IScannedFormRepository repo)
        {
            _scannedFormRepository = repo;
        }

        public async Task<int> UploadAsync(int electionId, int assetId, string formType, Stream fileStream,
                                          string fileName, int uploadedBy, string? description = null)
        {
            // Persist file to disk
            var uploadsRoot = Path.Combine(AppContext.BaseDirectory, "scanned-forms");
            Directory.CreateDirectory(uploadsRoot);
            var uniqueName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{fileName}";
            var filePath = Path.Combine(uploadsRoot, uniqueName);

            using var output = new FileStream(filePath, FileMode.Create, FileAccess.Write);
            fileStream.Position = 0;
            await fileStream.CopyToAsync(output);

            // Save record in DB
            var scannedForm = new ScannedForm(electionId, assetId, formType, filePath, uploadedBy)
            {
                FileName = fileName,
                BlobUrl = filePath,    // or actual blob URL if using cloud storage
                Description = description
            };
            var scannedFormId = await _scannedFormRepository.SaveAsync(scannedForm);

            return scannedFormId;
        }
    }
}
