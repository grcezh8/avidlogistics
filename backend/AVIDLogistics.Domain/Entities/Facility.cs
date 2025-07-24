using System;

namespace AVIDLogistics.Domain.Entities
{
    public class Facility
    {
        public int FacilityId { get; private set; }
        public string Name { get; private set; }
        public string Address { get; private set; }
        public string ContactInfo { get; private set; }
        public bool IsActive { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public int? ModifiedBy { get; private set; }
        public DateTime? ModifiedDate { get; private set; }

        public Facility(string name, string address, string contactInfo, int createdBy)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Address = address ?? throw new ArgumentNullException(nameof(address));
            ContactInfo = contactInfo ?? throw new ArgumentNullException(nameof(contactInfo));
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            IsActive = true;
        }

        public void UpdateInfo(string name, string address, string contactInfo, int modifiedBy)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Address = address ?? throw new ArgumentNullException(nameof(address));
            ContactInfo = contactInfo ?? throw new ArgumentNullException(nameof(contactInfo));
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }

        public void Deactivate(int modifiedBy)
        {
            IsActive = false;
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }
    }
}
