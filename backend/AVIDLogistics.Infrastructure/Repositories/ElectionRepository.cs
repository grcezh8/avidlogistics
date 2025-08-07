using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ElectionRepository : IElectionRepository
    {
        private readonly WarehouseDbContext _context;

        public ElectionRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Election> GetByIdAsync(int electionId)
        {
            return await _context.Elections.FindAsync(electionId);
        }

        public async Task<List<Election>> GetByStatusAsync(ElectionStatus status)
        {
            return await _context.Elections
                .Where(e => e.Status == status)
                .OrderBy(e => e.ElectionDate)
                .ToListAsync();
        }

        public async Task<List<Election>> GetUpcomingAsync()
        {
            return await _context.Elections
                .Where(e => e.ElectionDate > DateTime.UtcNow)
                .OrderBy(e => e.ElectionDate)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Election election)
        {
            _context.Elections.Add(election);
            await _context.SaveChangesAsync();
            return election.ElectionId;
        }

        public async Task UpdateAsync(Election election)
        {
            _context.Elections.Update(election);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Election>> GetAllAsync()
        {
            return await _context.Elections.ToListAsync();
        }

        public async Task AddAsync(Election election)
        {
            _context.Elections.Add(election);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var election = await _context.Elections.FindAsync(id);
            if (election != null)
            {
                _context.Elections.Remove(election);
                await _context.SaveChangesAsync();
            }
        }
    }
}
