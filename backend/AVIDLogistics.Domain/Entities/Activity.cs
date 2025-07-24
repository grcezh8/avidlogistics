using System;

namespace AVIDLogistics.Domain.Entities
{
    public class Activity
    {
        public int ActivityId { get; private set; }
        public string ActivityType { get; private set; }
        public string Description { get; private set; }
        public int UserId { get; private set; }
        public DateTime Timestamp { get; private set; }
        public int? ElectionId { get; private set; }
        public int? AssetId { get; private set; }
        public int? FacilityId { get; private set; }

        public Activity(string activityType, string description, int userId, 
            int? electionId = null, int? assetId = null, int? facilityId = null)
        {
            ActivityType = activityType ?? throw new ArgumentNullException(nameof(activityType));
            Description = description ?? throw new ArgumentNullException(nameof(description));
            UserId = userId;
            ElectionId = electionId;
            AssetId = assetId;
            FacilityId = facilityId;
            Timestamp = DateTime.UtcNow;
        }
    }
}
