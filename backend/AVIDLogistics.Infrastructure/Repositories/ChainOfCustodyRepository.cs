using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ChainOfCustodyRepository : IChainOfCustodyRepository
    {
        private readonly WarehouseDbContext _context;

        public ChainOfCustodyRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<ChainOfCustodyEvent?> GetByIdAsync(int eventId)
        {
            return await _context.ChainOfCustodyEvents.FindAsync(eventId);
        }

        public async Task<List<ChainOfCustodyEvent>> GetByElectionIdAsync(int electionId)
        {
            return await _context.ChainOfCustodyEvents
                .Where(c => c.ElectionId == electionId)
                .OrderByDescending(c => c.DateTime)
                .ToListAsync();
        }

        public async Task<List<ChainOfCustodyEvent>> GetByAssetIdAsync(int assetId)
        {
            return await _context.ChainOfCustodyEvents
                .Where(c => c.AssetId == assetId)
                .OrderByDescending(c => c.DateTime)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(ChainOfCustodyEvent custodyEvent)
        {
            _context.ChainOfCustodyEvents.Add(custodyEvent);
            await _context.SaveChangesAsync();
            return custodyEvent.EventId;
        }

        public async Task UpdateAsync(ChainOfCustodyEvent custodyEvent)
        {
            _context.ChainOfCustodyEvents.Update(custodyEvent);
            await _context.SaveChangesAsync();
        }

        // ✅ Add these methods to satisfy the interface

        public async Task<List<ChainOfCustodyEvent>> GetAllAsync()
        {
            return await _context.ChainOfCustodyEvents
                .OrderByDescending(c => c.DateTime)
                .ToListAsync();
        }

        public async Task AddAsync(ChainOfCustodyEvent custodyEvent)
        {
            _context.ChainOfCustodyEvents.Add(custodyEvent);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.ChainOfCustodyEvents.FindAsync(id);
            if (entity != null)
            {
                _context.ChainOfCustodyEvents.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
