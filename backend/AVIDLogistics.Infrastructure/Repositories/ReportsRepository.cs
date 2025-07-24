using Microsoft.EntityFrameworkCore;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Infrastructure.Data;

namespace AVIDLogistics.Infrastructure.Repositories
{
    public class ReportingRepository : IReportingRepository
{
    private readonly WarehouseDbContext _context;

    public ReportingRepository(WarehouseDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryStatusReport>> GetInventoryStatusByFacilityAsync(int? facilityId = null)
    {
        var query = _context.Facilities
            .Where(f => f.IsActive && (!facilityId.HasValue || f.FacilityId == facilityId))
            .Select(f => new InventoryStatusReport(
                f.FacilityId,
                f.Name,
                _context.Assets.Count(a => a.FacilityId == f.FacilityId),
                _context.Assets.Count(a => a.FacilityId == f.FacilityId && a.Status == AssetStatus.Available),
                _context.Assets.Count(a => a.FacilityId == f.FacilityId && a.Status == AssetStatus.Assigned),
                _context.Assets.Count(a => a.FacilityId == f.FacilityId && a.Status == AssetStatus.InTransit),
                _context.Assets.Count(a => a.FacilityId == f.FacilityId && a.Status == AssetStatus.Deployed),
                _context.Assets.Count(a => a.FacilityId == f.FacilityId && a.Status == AssetStatus.InMaintenance)
    ));


        return await query.ToListAsync();
    }

    public async Task<List<SealUsageReport>> GetSealUsageByElectionAsync(int? electionId = null)
    {
        var query = from e in _context.Elections
                    join s in _context.Seals on e.ElectionId equals s.ElectionId into seals
                    where !electionId.HasValue || e.ElectionId == electionId
                    select new SealUsageReport(
                        e.ElectionId,
                        e.Name,
                        seals.Count(),
                        seals.Count(s => s.Status == SealStatus.Available),
                        seals.Count(s => s.Status == SealStatus.Applied),
                        seals.Count(s => s.Status == SealStatus.Broken),
                        seals.Count(s => s.Status == SealStatus.Lost)
                    );

        return await query.ToListAsync();
    }

    public async Task<List<ChainOfCustodyReport>> GetChainOfCustodyLogAsync(int? electionId = null, int? assetId = null)
    {
        var query = from coc in _context.ChainOfCustodyEvents
                    join e in _context.Elections on coc.ElectionId equals e.ElectionId
                    join a in _context.Assets on coc.AssetId equals a.Id
                    where (!electionId.HasValue || coc.ElectionId == electionId) &&
                          (!assetId.HasValue || coc.AssetId == assetId)
                    orderby coc.DateTime descending
                    select new ChainOfCustodyReport(
                        coc.EventId,
                        coc.ElectionId,
                        e.Name,
                        coc.AssetId,
                        a.SerialNumber,
                        coc.FromParty,
                        coc.ToParty,
                        coc.DateTime,
                        coc.SealNumber,
                        coc.Notes
                    );

        return await query.ToListAsync();
    }

    public async Task<List<AssetStatusReport>> GetAssetStatusReportAsync(int? facilityId = null)
    {
        var query = from a in _context.Assets
                    join f in _context.Facilities on a.FacilityId equals f.FacilityId into facilities
                    from facility in facilities.DefaultIfEmpty()
                    where !facilityId.HasValue || a.FacilityId == facilityId
                    select new AssetStatusReport(
                        a.Id,
                        a.SerialNumber,
                        a.AssetType,
                        a.Status.ToString(),
                        a.Condition.ToString(),
                        a.Location,
                        a.FacilityId,
                        facility != null ? facility.Name : null
                    );

        return await query.ToListAsync();
    }

    public async Task<List<ManifestStatusReport>> GetManifestStatusReportAsync(int? electionId = null)
    {
        var query = from m in _context.Manifests
                    join e in _context.Elections on m.ElectionId equals e.ElectionId
                    where !electionId.HasValue || m.ElectionId == electionId
                    select new ManifestStatusReport(
                        m.ManifestId,
                        m.ManifestNumber,
                        m.ElectionId,
                        e.Name,
                        m.Status.ToString(),
                        m.Items.Count(),
                        m.Items.Count(i => i.IsPacked),
                        m.CreatedDate,
                        m.PackedDate
                    );

        return await query.ToListAsync();
    }
        
          public async Task<Report?> GetByIdAsync(int id)
    {
        return await _context.Reports.FindAsync(id);
    }

    public async Task<List<Report>> GetAllAsync()
    {
        return await _context.Reports.ToListAsync();
    }

    public async Task AddAsync(Report report)
    {
        _context.Reports.Add(report);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Report report)
    {
        _context.Reports.Update(report);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report != null)
        {
            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
        }
    }
}
}
