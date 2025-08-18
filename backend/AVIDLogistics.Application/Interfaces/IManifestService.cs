using AVIDLogistics.Application.DTOs;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IManifestService
    {
        Task<int> CreateManifestAsync(CreateManifestInput input, int createdBy);
        Task<int> CreateManifestWithAssetsAsync(CreateManifestWithAssetsInput input, int createdBy);
        Task AddItemToManifestAsync(AddManifestItemInput input);
        Task ReadyManifestForPackingAsync(int manifestId);
        Task MarkItemPackedAsync(MarkItemPackedInput input);
        Task CompleteManifestAsync(int manifestId);
        Task FinishPackingAsync(int manifestId, int packedBy);
        Task<ManifestWithDetailsDto> GetManifestWithDetailsAsync(int manifestId);
    }
}
