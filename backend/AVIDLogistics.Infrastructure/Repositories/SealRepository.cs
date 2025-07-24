using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class SealRepository : ISealRepository
    {
        private readonly WarehouseDbContext _context;

        public SealRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Seal?> GetByIdAsync(int id)
        {
            return await _context.Seals.FindAsync(id);
        }

        public async Task<List<Seal>> GetAllAsync()
        {
            return await _context.Seals
                .OrderBy(s => s.SealNumber)
                .ToListAsync();
        }

        public async Task AddAsync(Seal seal)
        {
            _context.Seals.Add(seal);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Seal seal)
        {
            _context.Seals.Update(seal);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var seal = await _context.Seals.FindAsync(id);
            if (seal != null)
            {
                _context.Seals.Remove(seal);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string sealNumber)
        {
            return await _context.Seals.AnyAsync(s => s.SealNumber == sealNumber);
        }

        public async Task<int> SaveAsync(Seal seal)
        {
            _context.Seals.Add(seal);
            await _context.SaveChangesAsync();
            return seal.SealId;
        }

        public async Task<Seal?> GetBySealNumberAsync(string sealNumber)
        {
            return await _context.Seals
                .FirstOrDefaultAsync(s => s.SealNumber == sealNumber);
        }

        public async Task<List<Seal>> GetByStatusAsync(SealStatus status)
        {
            return await _context.Seals
                .Where(s => s.Status == status)
                .OrderBy(s => s.SealNumber)
                .ToListAsync();
        }

        public async Task<List<Seal>> GetByElectionIdAsync(int electionId)
        {
            return await _context.Seals
                .Where(s => s.ElectionId == electionId)
                .OrderBy(s => s.SealNumber)
                .ToListAsync();
        }
    }
}
