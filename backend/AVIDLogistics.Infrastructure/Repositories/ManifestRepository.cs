using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;
using AVIDLogistics.Domain.Enums;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ManifestRepository : IManifestRepository
    {
        private readonly WarehouseDbContext _context;

        public ManifestRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Manifest> GetByIdAsync(int manifestId)
        {
            return await _context.Manifests
                .Include(m => m.Items)
                .FirstOrDefaultAsync(m => m.ManifestId == manifestId);
        }

        public async Task<List<Manifest>> GetByElectionIdAsync(int electionId)
        {
            return await _context.Manifests
                .Include(m => m.Items)
                .Where(m => m.ElectionId == electionId)
                .OrderByDescending(m => m.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<Manifest>> GetByFacilityIdAsync(int facilityId)
        {
            return await _context.Manifests
                .Include(m => m.Items)
                .Where(m => m.FromFacilityId == facilityId)
                .OrderByDescending(m => m.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<Manifest>> GetByStatusAsync(ManifestStatus status)
        {
            return await _context.Manifests
                .Include(m => m.Items)
                .Where(m => m.Status == status)
                .OrderBy(m => m.CreatedDate)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Manifest manifest)
        {
            _context.Manifests.Add(manifest);
            await _context.SaveChangesAsync();
            return manifest.ManifestId;
        }

        public async Task UpdateAsync(Manifest manifest)
        {
            _context.Manifests.Update(manifest);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Manifest>> GetAllAsync()
        {
            return await _context.Manifests
            .Include(m => m.Items)
            .ToListAsync();
        }

        public async Task AddAsync(Manifest manifest)
        {
            _context.Manifests.Add(manifest);
            await _context.SaveChangesAsync();
        }

    }
}
