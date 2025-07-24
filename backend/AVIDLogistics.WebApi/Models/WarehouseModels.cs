using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AVIDLogistics.WebApi.Models
{
    // Core Warehouse Management Entities
    public class Asset
    {
        public int AssetId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string SerialNumber { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? Model { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "InStorage";
        
        public int? LocationId { get; set; }
        public Location? Location { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; }
        
        // Navigation properties
        public ICollection<AssetStatus> Statuses { get; set; } = new List<AssetStatus>();
        public ICollection<ChainOfCustodyEvent> ChainOfCustodyEvents { get; set; } = new List<ChainOfCustodyEvent>();
        public ICollection<ManifestItem> ManifestItems { get; set; } = new List<ManifestItem>();
    }

    public class Election
    {
        public int ElectionId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public DateTime ElectionDate { get; set; }
        
        [StringLength(100)]
        public string? Type { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "Planning";
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        
        // Navigation properties
        public ICollection<AssetStatus> AssetStatuses { get; set; } = new List<AssetStatus>();
        public ICollection<ChainOfCustodyEvent> ChainOfCustodyEvents { get; set; } = new List<ChainOfCustodyEvent>();
        public ICollection<Manifest> Manifests { get; set; } = new List<Manifest>();
        public ICollection<Seal> Seals { get; set; } = new List<Seal>();
    }

    public class Location
    {
        public int LocationId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Address { get; set; }
        
        [StringLength(50)]
        public string Type { get; set; } = "Warehouse";
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<Asset> Assets { get; set; } = new List<Asset>();
        public ICollection<AssetStatus> AssetStatuses { get; set; } = new List<AssetStatus>();
    }

    public class AssetStatus
    {
        public int AssetStatusId { get; set; }
        
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        
        public int ElectionId { get; set; }
        public Election Election { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;
        
        public int? LocationId { get; set; }
        public Location? Location { get; set; }
        
        public DateTime DateTime { get; set; } = DateTime.UtcNow;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class Seal
    {
        public int SealId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string SealNumber { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string Status { get; set; } = "Available";
        
        public int? ElectionId { get; set; }
        public Election? Election { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UsedDate { get; set; }
        
        // Navigation properties
        public ICollection<ChainOfCustodyEvent> ChainOfCustodyEvents { get; set; } = new List<ChainOfCustodyEvent>();
    }

    public class Manifest
    {
        public int ManifestId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string ManifestNumber { get; set; } = string.Empty;
        
        public int ElectionId { get; set; }
        public Election Election { get; set; } = null!;
        
        [StringLength(50)]
        public string Type { get; set; } = "Delivery";
        
        [StringLength(50)]
        public string Status { get; set; } = "Created";
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int CreatedBy { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        // Navigation properties
        public ICollection<ManifestItem> Items { get; set; } = new List<ManifestItem>();
    }

    public class ManifestItem
    {
        public int ManifestItemId { get; set; }
        
        public int ManifestId { get; set; }
        public Manifest Manifest { get; set; } = null!;
        
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        
        public int Quantity { get; set; } = 1;
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;
    }

    public class ChainOfCustodyEvent
    {
        public int EventId { get; set; }
        
        public int ElectionId { get; set; }
        public Election Election { get; set; } = null!;
        
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        
        [Required]
        [StringLength(200)]
        public string FromParty { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string ToParty { get; set; } = string.Empty;
        
        public DateTime DateTime { get; set; } = DateTime.UtcNow;
        
        [StringLength(50)]
        public string? SealNumber { get; set; }
        
        public int? ScannedFormId { get; set; }
        public ScannedForm? ScannedForm { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class ScannedForm
    {
        public int ScannedFormId { get; set; }
        
        [Required]
        [StringLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string ImageUrl { get; set; } = string.Empty;
        
        public int? ElectionId { get; set; }
        public Election? Election { get; set; }
        
        public int? AssetId { get; set; }
        public Asset? Asset { get; set; }
        
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public int UploadedBy { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        // Navigation properties
        public ICollection<ChainOfCustodyEvent> ChainOfCustodyEvents { get; set; } = new List<ChainOfCustodyEvent>();
    }

    public class User
    {
        public int UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "WarehouseStaff";
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<AssetStatus> AssetStatuses { get; set; } = new List<AssetStatus>();
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }

    public class Activity
    {
        public int ActivityId { get; set; }
        
        public int? AssetId { get; set; }
        public Asset? Asset { get; set; }
        
        public int? ElectionId { get; set; }
        public Election? Election { get; set; }
        
        [Required]
        [StringLength(100)]
        public string ActivityType { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime DateTime { get; set; } = DateTime.UtcNow;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    // DTOs for API requests/responses
    public class CreateAssetRequest
    {
        [Required]
        public string SerialNumber { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty;
        
        public string? Model { get; set; }
        public string Status { get; set; } = "InStorage";
        public int? LocationId { get; set; }
    }

    public class UpdateAssetRequest
    {
        public string? Type { get; set; }
        public string? Model { get; set; }
        public string? Status { get; set; }
        public int? LocationId { get; set; }
    }

    public class CreateAssetStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
        
        [Required]
        public int ElectionId { get; set; }
        
        public int? LocationId { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateElectionRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public DateTime ElectionDate { get; set; }
        
        public string? Type { get; set; }
    }

    public class CreateSealRequest
    {
        [Required]
        public string SealNumber { get; set; } = string.Empty;
        
        public int? ElectionId { get; set; }
    }

    public class CreateManifestRequest
    {
        [Required]
        public int ElectionId { get; set; }
        
        public string Type { get; set; } = "Delivery";
        public string? Notes { get; set; }
    }

    public class AddManifestItemRequest
    {
        [Required]
        public int AssetId { get; set; }
        
        public int Quantity { get; set; } = 1;
        public string? Notes { get; set; }
    }

    public class CreateChainOfCustodyEventRequest
    {
        [Required]
        public int AssetId { get; set; }
        
        [Required]
        public int ElectionId { get; set; }
        
        [Required]
        public string FromParty { get; set; } = string.Empty;
        
        [Required]
        public string ToParty { get; set; } = string.Empty;
        
        public string? SealNumber { get; set; }
        public int? ScannedFormId { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateLocationRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Address { get; set; }
        public string Type { get; set; } = "Warehouse";
    }

    public class CreateUserRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "WarehouseStaff";
    }

    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class UserProfileResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}
