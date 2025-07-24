using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class FacilityRepository : IFacilityRepository
    {
        private readonly WarehouseDbContext _context;

        public FacilityRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Facility> GetByIdAsync(int facilityId)
        {
            return await _context.Facilities.FindAsync(facilityId);
        }

        public async Task<List<Facility>> GetAllActiveAsync()
        {
            return await _context.Facilities
                .Where(f => f.IsActive)
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<List<Facility>> GetByNameAsync(string name)
        {
            return await _context.Facilities
                .Where(f => f.Name.Contains(name) && f.IsActive)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Facility facility)
        {
            _context.Facilities.Add(facility);
            await _context.SaveChangesAsync();
            return facility.FacilityId;
        }

        public async Task UpdateAsync(Facility facility)
        {
            _context.Facilities.Update(facility);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(string name)
        {
            return await _context.Facilities
                .AnyAsync(f => f.Name == name && f.IsActive);
        }

        public async Task<List<Facility>> GetAllAsync()
        {       
            return await _context.Facilities.ToListAsync();
        }

        public async Task AddAsync(Facility facility)
        {
            _context.Facilities.Add(facility);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var facility = await _context.Facilities.FindAsync(id);
            if (facility != null)
            {
                _context.Facilities.Remove(facility);
                await _context.SaveChangesAsync();
            }
        }

    }
}
