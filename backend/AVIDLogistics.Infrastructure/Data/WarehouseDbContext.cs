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

        // Chain of Custody entities
        public DbSet<Signature> Signatures { get; set; }
        public DbSet<CoCFormStatus> CoCFormStatuses { get; set; }

        // Legacy entities for compatibility
        public DbSet<Kit> Kits { get; set; }
        public DbSet<AssetKit> AssetKits { get; set; }
        public DbSet<DeliveryManifest> DeliveryManifests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Asset entity configuration to match ACTUAL database schema
            modelBuilder.Entity<Asset>(entity =>
            {
                entity.ToTable("Assets");
                entity.HasKey(e => e.Id);
                
                // Map to actual database columns
                entity.Property(e => e.Id).HasColumnName("Id"); // Explicitly map to Id column
                entity.Property(e => e.SerialNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AssetType).IsRequired().HasMaxLength(100); // Updated to match migration
                entity.Property(e => e.Barcode).HasMaxLength(50);
                entity.Property(e => e.RfidTag).HasMaxLength(50);
                entity.Property(e => e.Location).HasMaxLength(200); // Updated to match migration
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.Condition).HasConversion<int>();
                entity.Property(e => e.RegisteredDate);
                entity.Property(e => e.FacilityId);
                entity.Property(e => e.CreatedDate);
                entity.Property(e => e.ModifiedDate);
                
                entity.HasIndex(e => e.SerialNumber).IsUnique();
                
                // Apply filtered unique indexes for nullable columns
                entity.HasIndex(e => e.Barcode).IsUnique().HasFilter("[Barcode] IS NOT NULL");
                entity.HasIndex(e => e.RfidTag).IsUnique().HasFilter("[RfidTag] IS NOT NULL");
                
                // Configure the many-to-many relationship through AssetKit
                entity.HasMany(e => e.AssetKits)
                      .WithOne(ak => ak.Asset)
                      .HasForeignKey(ak => ak.AssetId);
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
                entity.Property(e => e.IsPacked).IsRequired();
                entity.Property(e => e.PackedBy);
                entity.Property(e => e.PackedDate);
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
                entity.Property(e => e.ContactPerson).HasMaxLength(100);
                entity.Property(e => e.ContactPhone).HasMaxLength(50);
                entity.Property(e => e.ContactEmail).HasMaxLength(255);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure PollSite entity
            modelBuilder.Entity<PollSite>(entity =>
            {
                entity.HasKey(e => e.PollSiteId);
                entity.Property(e => e.SiteNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FacilityName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.HouseNumber).HasMaxLength(50);
                entity.Property(e => e.StreetName).HasMaxLength(200);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.State).HasMaxLength(50);
                entity.Property(e => e.ZipCode).HasMaxLength(20);
                entity.Property(e => e.MAddress1).HasMaxLength(200);
                entity.Property(e => e.MCity).HasMaxLength(100);
                entity.Property(e => e.MState).HasMaxLength(50);
                entity.Property(e => e.MZipCode).HasMaxLength(20);
                entity.HasIndex(e => e.SiteNumber).IsUnique();
            });

            // Configure BDELRequest entity
            modelBuilder.Entity<BDELRequest>(entity =>
            {
                entity.HasKey(e => e.RequestId);
                entity.Property(e => e.RequestNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasIndex(e => e.RequestNumber).IsUnique();
            });

            // Configure BDELRequestItem entity
            modelBuilder.Entity<BDELRequestItem>(entity =>
            {
                entity.HasKey(e => e.ItemId);
                entity.Property(e => e.ItemDescription).IsRequired().HasMaxLength(500);
            });

            // Configure ElectionEvent entity
            modelBuilder.Entity<ElectionEvent>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
            });

            // Configure PoliticalDistrict entity
            modelBuilder.Entity<PoliticalDistrict>(entity =>
            {
                entity.HasKey(e => e.DistrictId);
                entity.Property(e => e.DistrictKey).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
                entity.Property(e => e.DistrictType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Abbreviation).HasMaxLength(10);
                entity.HasIndex(e => e.DistrictKey).IsUnique();
            });

            // Configure AuditSession entity
            modelBuilder.Entity<AuditSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SessionNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.SessionNumber).IsUnique();
            });

            // Configure Kit entity
            modelBuilder.Entity<Kit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("KitID"); // Map to actual database column
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).HasColumnName("KitType").HasConversion<int>();
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.PollSiteId).HasColumnName("PollSiteID");
                entity.Property(e => e.CreatedDate);
                
                // Configure the many-to-many relationship through AssetKit
                entity.HasMany(e => e.AssetKits)
                      .WithOne(ak => ak.Kit)
                      .HasForeignKey(ak => ak.KitId);
            });

            // Configure AssetKit junction entity
            modelBuilder.Entity<AssetKit>(entity =>
            {
                entity.HasKey(ak => new { ak.AssetId, ak.KitId });
                
                entity.Property(ak => ak.AssignedDate).IsRequired();
                entity.Property(ak => ak.AssignedBy).IsRequired();
                
                // Configure relationships
                entity.HasOne(ak => ak.Asset)
                      .WithMany(a => a.AssetKits)
                      .HasForeignKey(ak => ak.AssetId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(ak => ak.Kit)
                      .WithMany(k => k.AssetKits)
                      .HasForeignKey(ak => ak.KitId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                // Indexes for performance
                entity.HasIndex(ak => ak.KitId);
                entity.HasIndex(ak => ak.AssignedDate);
            });

            // Configure Signature entity
            modelBuilder.Entity<Signature>(entity =>
            {
                entity.HasKey(e => e.SignatureId);
                entity.Property(e => e.SignedBy).IsRequired().HasMaxLength(100);
                entity.Property(e => e.SignatureImageUrl).HasMaxLength(500);
                entity.Property(e => e.SignatureType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.IsValid).IsRequired();
                
                entity.HasOne(e => e.ChainOfCustodyEvent)
                      .WithMany()
                      .HasForeignKey(e => e.ChainOfCustodyEventId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CoCFormStatus entity
            modelBuilder.Entity<CoCFormStatus>(entity =>
            {
                entity.HasKey(e => e.CoCFormStatusId);
                entity.Property(e => e.FormUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.RequiredSignatures).IsRequired();
                entity.Property(e => e.CompletedSignatures).IsRequired();
                entity.Property(e => e.AccessCount).IsRequired();
                
                entity.HasOne(e => e.Manifest)
                      .WithMany()
                      .HasForeignKey(e => e.ManifestId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasIndex(e => e.FormUrl).IsUnique();
                entity.HasIndex(e => e.ManifestId).IsUnique();
                entity.HasIndex(e => e.Status);
            });

            // Configure other entities as needed...
        }
    }
}
