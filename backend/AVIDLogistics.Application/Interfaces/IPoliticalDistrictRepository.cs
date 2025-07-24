using System.Collections.Generic;
using System.Threading.Tasks;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IPoliticalDistrictRepository
    {
        Task<PoliticalDistrict?> GetByIdAsync(int id);
        Task<List<PoliticalDistrict>> GetAllAsync();
        Task<int> SaveAsync(PoliticalDistrict district);
        Task UpdateAsync(PoliticalDistrict district);
        Task DeleteAsync(int id);
    }
}

