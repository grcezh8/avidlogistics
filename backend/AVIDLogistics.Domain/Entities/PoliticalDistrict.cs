using System;

namespace AVIDLogistics.Domain.Entities
{
    public class PoliticalDistrict
    {
        public int DistrictId { get; private set; }
        public string DistrictKey { get; private set; }
        public string Description { get; private set; }
        public string DistrictType { get; private set; }
        public string Abbreviation { get; private set; }
        public int? ParentDistrictId { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedDate { get; private set; }

        // Parameterless constructor for Entity Framework
        protected PoliticalDistrict() { }

        public PoliticalDistrict(string districtKey, string description, string districtType,
            string abbreviation = null, int? parentDistrictId = null)
        {
            DistrictKey = districtKey ?? throw new ArgumentNullException(nameof(districtKey));
            Description = description ?? throw new ArgumentNullException(nameof(description));
            DistrictType = districtType ?? throw new ArgumentNullException(nameof(districtType));
            Abbreviation = abbreviation;
            ParentDistrictId = parentDistrictId;
            IsActive = true;
            CreatedDate = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
