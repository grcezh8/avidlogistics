using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class AuditSessionRepository : IAuditSessionRepository
    {
        private readonly WarehouseDbContext _context;

        public AuditSessionRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<AuditSession?> GetByIdAsync(int id)
        {
            return await _context.AuditSessions.FindAsync(id);
        }

        public async Task<List<AuditSession>> GetAllAsync()
        {
            return await _context.AuditSessions.ToListAsync();
        }

        public async Task AddAsync(AuditSession session)
        {
            await _context.AuditSessions.AddAsync(session);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(AuditSession session)
        {
            _context.AuditSessions.Update(session);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var session = await _context.AuditSessions.FindAsync(id);
            if (session != null)
            {
                _context.AuditSessions.Remove(session);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> SaveAsync(AuditSession session)
        {
            _context.AuditSessions.Add(session);
            await _context.SaveChangesAsync();
            return session.Id; // Ensure AuditSession has an Id property
        }
    }
}
