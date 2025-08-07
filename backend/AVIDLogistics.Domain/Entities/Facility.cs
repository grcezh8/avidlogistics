using System;

namespace AVIDLogistics.Domain.Entities
{
    public class Facility
    {
        public int FacilityId { get; private set; }
        public string Name { get; private set; }
        public string Address { get; private set; }
        public string County { get; private set; }
        public string ContactPerson { get; private set; }
        public string ContactPhone { get; private set; }
        public string ContactEmail { get; private set; }
        public string FacilityType { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public DateTime ModifiedDate { get; private set; }

        // Parameterless constructor for EF Core
        private Facility()
        {
        }

        public Facility(
            string name,
            string address = null,
            string county = null,
            string contactPerson = null,
            string contactPhone = null,
            string contactEmail = null,
            string facilityType = "Warehouse")
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Address = address;
            County = county;
            ContactPerson = contactPerson;
            ContactPhone = contactPhone;
            ContactEmail = contactEmail;
            FacilityType = facilityType ?? "Warehouse";
            IsActive = true;
            CreatedDate = DateTime.UtcNow;
            ModifiedDate = DateTime.UtcNow;
        }

        public void UpdateContactInfo(string contactPerson, string contactPhone, string contactEmail)
        {
            ContactPerson = contactPerson;
            ContactPhone = contactPhone;
            ContactEmail = contactEmail;
            ModifiedDate = DateTime.UtcNow;
        }

        public void UpdateAddress(string address, string county)
        {
            Address = address;
            County = county;
            ModifiedDate = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            ModifiedDate = DateTime.UtcNow;
        }

        public void Activate()
        {
            IsActive = true;
            ModifiedDate = DateTime.UtcNow;
        }
    }
}
