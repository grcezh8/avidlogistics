using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ScannedFormRepository : IScannedFormRepository
    {
        private readonly WarehouseDbContext _context;

        public ScannedFormRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<ScannedForm> GetByIdAsync(int scannedFormId)
        {
            return await _context.ScannedForms.FindAsync(scannedFormId);
        }

        public async Task<List<ScannedForm>> GetAllAsync()
        {
            return await _context.ScannedForms
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task<List<ScannedForm>> GetByElectionIdAsync(int electionId)
        {
            return await _context.ScannedForms
                .Where(sf => sf.ElectionId == electionId)
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task<List<ScannedForm>> GetByAssetIdAsync(int assetId)
        {
            return await _context.ScannedForms
                .Where(sf => sf.AssetId == assetId)
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(ScannedForm scannedForm)
        {
            _context.ScannedForms.Add(scannedForm);
            await _context.SaveChangesAsync();
            return scannedForm.ScannedFormId;
        }

        public async Task AddAsync(ScannedForm scannedForm)
        {
            _context.ScannedForms.Add(scannedForm);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ScannedForm scannedForm)
        {
            _context.ScannedForms.Update(scannedForm);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int scannedFormId)
        {
            var form = await _context.ScannedForms.FindAsync(scannedFormId);
            if (form != null)
            {
                _context.ScannedForms.Remove(form);
                await _context.SaveChangesAsync();
            }
        }
    }
}
