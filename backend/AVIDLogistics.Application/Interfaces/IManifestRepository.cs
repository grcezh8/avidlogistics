using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;


namespace AVIDLogistics.Application.Interfaces
{
    public interface IManifestRepository
    {
        Task<Manifest?> GetByIdAsync(int id);
        Task<List<Manifest>> GetAllAsync();
        Task AddAsync(Manifest manifest);
        Task UpdateAsync(Manifest manifest);
        Task<int> SaveAsync(Manifest manifest);
        Task<List<Manifest>> GetByStatusAsync(ManifestStatus status);
        Task<List<Manifest>> GetByElectionIdAsync(int electionId);
        Task<List<Manifest>> GetByFacilityIdAsync(int facilityId);
    }
}
