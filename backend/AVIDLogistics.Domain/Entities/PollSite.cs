using System;

namespace AVIDLogistics.Domain.Entities
{
    public class PollSite
    {
        public int PollSiteId { get; private set; }
        public string SiteNumber { get; private set; }
        public string FacilityName { get; private set; }
        public int BuildingTypeId { get; private set; }
        public int FacilityStatusId { get; private set; }
        public int FacilityAccessibilityId { get; private set; }
        public string HouseNumber { get; private set; }
        public string StreetName { get; private set; }
        public string City { get; private set; }
        public string State { get; private set; }
        public string ZipCode { get; private set; }
        public int CountyId { get; private set; }
        public int PolicePrecinctId { get; private set; }
        public string MAddress1 { get; private set; }
        public string MCity { get; private set; }
        public string MState { get; private set; }
        public string MZipCode { get; private set; }
        public decimal? Latitude { get; private set; }
        public decimal? Longitude { get; private set; }
        public bool IsActive { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public int? ModifiedBy { get; private set; }
        public DateTime? ModifiedDate { get; private set; }

        public PollSite(string siteNumber, string facilityName, int buildingTypeId,
            int facilityStatusId, int facilityAccessibilityId, string houseNumber,
            string streetName, string city, string state, string zipCode,
            int countyId, int policePrecinctId, string mAddress1, string mCity,
            string mState, string mZipCode, int createdBy)
        {
            SiteNumber = siteNumber ?? throw new ArgumentNullException(nameof(siteNumber));
            FacilityName = facilityName ?? throw new ArgumentNullException(nameof(facilityName));
            BuildingTypeId = buildingTypeId;
            FacilityStatusId = facilityStatusId;
            FacilityAccessibilityId = facilityAccessibilityId;
            HouseNumber = houseNumber;
            StreetName = streetName;
            City = city;
            State = state;
            ZipCode = zipCode;
            CountyId = countyId;
            PolicePrecinctId = policePrecinctId;
            MAddress1 = mAddress1;
            MCity = mCity;
            MState = mState;
            MZipCode = mZipCode;
            CreatedBy = createdBy;
            CreatedDate = DateTime.UtcNow;
            IsActive = true;
        }

        public void UpdateFacilityInfo(string facilityName, int buildingTypeId,
            int facilityStatusId, int facilityAccessibilityId, int modifiedBy)
        {
            FacilityName = facilityName ?? throw new ArgumentNullException(nameof(facilityName));
            BuildingTypeId = buildingTypeId;
            FacilityStatusId = facilityStatusId;
            FacilityAccessibilityId = facilityAccessibilityId;
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }

        public void UpdateLocation(string houseNumber, string streetName, string city,
            string state, string zipCode, decimal? latitude, decimal? longitude, int modifiedBy)
        {
            HouseNumber = houseNumber;
            StreetName = streetName;
            City = city;
            State = state;
            ZipCode = zipCode;
            Latitude = latitude;
            Longitude = longitude;
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }

        public void MarkReady(int modifiedBy)
        {
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }

        public void Cancel(string reason, int modifiedBy)
        {
            IsActive = false;
            ModifiedBy = modifiedBy;
            ModifiedDate = DateTime.UtcNow;
        }
    }
}
