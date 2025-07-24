using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Infrastructure.Data
{
    public class WarehouseDbContext : DbContext
    {
        public WarehouseDbContext(DbContextOptions<WarehouseDbContext> options) : base(options)
        {
        }

        // Core Domain Entities
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Election> Elections { get; set; }
        public DbSet<Seal> Seals { get; set; }
        public DbSet<Manifest> Manifests { get; set; }
        public DbSet<ManifestItem> ManifestItems { get; set; }
        public DbSet<ChainOfCustodyEvent> ChainOfCustodyEvents { get; set; }
        public DbSet<ScannedForm> ScannedForms { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Facility> Facilities { get; set; }
        public DbSet<PollSite> PollSites { get; set; }
        public DbSet<BDELRequest> BDELRequests { get; set; }
        public DbSet<BDELRequestItem> BDELRequestItems { get; set; }
        public DbSet<ElectionEvent> ElectionEvents { get; set; }
        public DbSet<PoliticalDistrict> PoliticalDistricts { get; set; }
        public DbSet<AuditSession> AuditSessions { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Alert> Alerts { get; set; }

        // Legacy entities for compatibility
        public DbSet<Kit> Kits { get; set; }
        public DbSet<DeliveryManifest> DeliveryManifests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Asset entity to map to actual database table structure
            modelBuilder.Entity<Asset>(entity =>
            {
                entity.ToTable("Assets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.SerialNumber).IsRequired().HasMaxLength(100).HasColumnName("SerialNumber");
                entity.Property(e => e.AssetType).IsRequired().HasMaxLength(50).HasColumnName("AssetType");
                entity.Property(e => e.Barcode).HasMaxLength(100).HasColumnName("Barcode");
                entity.Property(e => e.RfidTag).HasMaxLength(100).HasColumnName("RfidTag");
                entity.Property(e => e.Location).HasMaxLength(200).HasColumnName("Location");
                entity.Property(e => e.Status).HasColumnName("Status");
                entity.Property(e => e.Condition).HasColumnName("Condition");
                entity.Property(e => e.FacilityId).HasColumnName("FacilityId");
                entity.Ignore(e => e.ElectionId); // Ignore ElectionId since it doesn't exist in database
                entity.Property(e => e.RegisteredDate).HasColumnName("RegisteredDate");
                entity.HasIndex(e => e.SerialNumber).IsUnique();
            });

            // Configure Election entity
            modelBuilder.Entity<Election>(entity =>
            {
                entity.HasKey(e => e.ElectionId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ElectionType).IsRequired().HasMaxLength(50);
            });

            // Configure Seal entity
            modelBuilder.Entity<Seal>(entity =>
            {
                entity.HasKey(e => e.SealId);
                entity.Property(e => e.SealNumber).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.SealNumber).IsUnique();
            });

            // Configure Manifest entity
            modelBuilder.Entity<Manifest>(entity =>
            {
                entity.HasKey(e => e.ManifestId);
                entity.Property(e => e.ManifestNumber).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.ManifestNumber).IsUnique();
                entity.HasMany(e => e.Items)
                      .WithOne()
                      .HasForeignKey("ManifestId");
            });

            // Configure ManifestItem entity
            modelBuilder.Entity<ManifestItem>(entity =>
            {
                entity.HasKey(e => e.ManifestItemId);
                entity.Property(e => e.SealNumber).HasMaxLength(50);
            });

            // Configure ChainOfCustodyEvent entity
            modelBuilder.Entity<ChainOfCustodyEvent>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.FromParty).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ToParty).IsRequired().HasMaxLength(200);
                entity.Property(e => e.SealNumber).HasMaxLength(50);
                entity.Property(e => e.Notes).HasMaxLength(1000);
            });

            // Configure ScannedForm entity
            modelBuilder.Entity<ScannedForm>(entity =>
            {
                entity.HasKey(e => e.ScannedFormId);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.BlobUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.FormType).HasMaxLength(50);
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Configure Activity entity
            modelBuilder.Entity<Activity>(entity =>
            {
                entity.HasKey(e => e.ActivityId);
                entity.Property(e => e.ActivityType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            });

            // Configure Facility entity
            modelBuilder.Entity<Facility>(entity =>
            {
                entity.HasKey(e => e.FacilityId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
                entity.Property(e => e.ContactInfo).HasMaxLength(500);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure PollSite entity
            modelBuilder.Entity<PollSite>(entity =>
            {
                entity.HasKey(e => e.PollSiteId);
                entity.Property(e => e.SiteNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FacilityName).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.SiteNumber).IsUnique();
            });

            // Configure other entities as needed...
        }
    }
}
