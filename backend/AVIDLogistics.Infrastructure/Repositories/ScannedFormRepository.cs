using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ScannedFormRepository : IScannedFormRepository
    {
        private readonly WarehouseDbContext _context;

        public ScannedFormRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveAsync(ScannedForm scannedForm)
        {
            _context.ScannedForms.Add(scannedForm);
            await _context.SaveChangesAsync();
            return scannedForm.ScannedFormId;
        }

        public async Task<ScannedForm?> GetByIdAsync(int scannedFormId)
        {
            return await _context.ScannedForms
                .FirstOrDefaultAsync(sf => sf.ScannedFormId == scannedFormId);
        }

        public async Task<IEnumerable<ScannedForm>> GetByElectionIdAsync(int electionId)
        {
            return await _context.ScannedForms
                .Where(sf => sf.ElectionId == electionId)
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScannedForm>> GetByAssetIdAsync(int assetId)
        {
            return await _context.ScannedForms
                .Where(sf => sf.AssetId == assetId)
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScannedForm>> GetByFormTypeAsync(string formType)
        {
            return await _context.ScannedForms
                .Where(sf => sf.FormType == formType)
                .OrderByDescending(sf => sf.UploadedDate)
                .ToListAsync();
        }

        public async Task UpdateAsync(ScannedForm scannedForm)
        {
            _context.ScannedForms.Update(scannedForm);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int scannedFormId)
        {
            var scannedForm = await GetByIdAsync(scannedFormId);
            if (scannedForm != null)
            {
                _context.ScannedForms.Remove(scannedForm);
                await _context.SaveChangesAsync();
            }
        }
    }
}
