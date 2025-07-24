using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly WarehouseDbContext _context;

        public ActivityRepository(WarehouseDbContext context)
        {
            _context = context;
        }

        public async Task<Activity> GetByIdAsync(int activityId)
        {
            return await _context.Activities.FindAsync(activityId);
        }

        public async Task<List<Activity>> GetByUserIdAsync(int userId)
        {
            return await _context.Activities
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByElectionIdAsync(int electionId)
        {
            return await _context.Activities
                .Where(a => a.ElectionId == electionId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByAssetIdAsync(int assetId)
        {
            return await _context.Activities
                .Where(a => a.AssetId == assetId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByFacilityIdAsync(int facilityId)
        {
            return await _context.Activities
                .Where(a => a.FacilityId == facilityId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<int> SaveAsync(Activity activity)
        {
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();
            return activity.ActivityId;
        }

        public async Task<List<Activity>> GetAllAsync()
        {
            return await _context.Activities.ToListAsync();
        }

        public async Task AddAsync(Activity activity)
        {
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Activity activity)
        {
            _context.Activities.Update(activity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity != null)
            {
                _context.Activities.Remove(activity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
