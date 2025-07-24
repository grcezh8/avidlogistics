using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IElectionEventRepository
    {
        Task<ElectionEvent?> GetByIdAsync(int id);
        Task<IEnumerable<ElectionEvent>> GetAllAsync();
        Task AddAsync(ElectionEvent electionEvent);
        Task UpdateAsync(ElectionEvent electionEvent);
        Task DeleteAsync(int id);
    }
}
