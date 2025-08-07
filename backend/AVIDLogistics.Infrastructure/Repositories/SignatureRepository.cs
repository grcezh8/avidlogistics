using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class SignatureRepository : ISignatureRepository
    {
        private readonly WarehouseDbContext _context;

        public SignatureRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveAsync(Signature signature)
        {
            _context.Signatures.Add(signature);
            await _context.SaveChangesAsync();
            return signature.SignatureId;
        }

        public async Task<Signature?> GetByIdAsync(int signatureId)
        {
            return await _context.Signatures
                .Include(s => s.ChainOfCustodyEvent)
                .FirstOrDefaultAsync(s => s.SignatureId == signatureId);
        }

        public async Task<IEnumerable<Signature>> GetByChainOfCustodyEventIdAsync(int chainOfCustodyEventId)
        {
            return await _context.Signatures
                .Where(s => s.ChainOfCustodyEventId == chainOfCustodyEventId)
                .OrderBy(s => s.SignedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateAsync(Signature signature)
        {
            _context.Signatures.Update(signature);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int signatureId)
        {
            var signature = await _context.Signatures.FindAsync(signatureId);
            if (signature == null)
                return false;

            _context.Signatures.Remove(signature);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IEnumerable<Signature>> GetBySignedByAsync(string signedBy)
        {
            return await _context.Signatures
                .Where(s => s.SignedBy.Contains(signedBy))
                .OrderByDescending(s => s.SignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Signature>> GetInvalidSignaturesAsync()
        {
            return await _context.Signatures
                .Where(s => !s.IsValid)
                .OrderByDescending(s => s.SignedAt)
                .ToListAsync();
        }
    }
}
