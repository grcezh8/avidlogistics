using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using System.Linq;

namespace AVIDLogistics.Application.UseCases
{
    public class ReportingService
    {
        private readonly IReportingRepository _reportingRepository;

        public ReportingService(IReportingRepository reportingRepository)
        {
            _reportingRepository = reportingRepository;
        }

        public async Task<List<InventoryStatusReport>> GetInventoryStatusAsync(int? facilityId = null)
        {
            return await _reportingRepository.GetInventoryStatusByFacilityAsync(facilityId);
        }

        public async Task<List<SealUsageReport>> GetSealUsageAsync(int? electionId = null)
        {
            return await _reportingRepository.GetSealUsageByElectionAsync(electionId);
        }

        public async Task<List<ChainOfCustodyReport>> GetChainOfCustodyLogAsync(int? electionId = null, int? assetId = null)
        {
            return await _reportingRepository.GetChainOfCustodyLogAsync(electionId, assetId);
        }

        public async Task<List<AssetStatusReport>> GetAssetStatusReportAsync(int? facilityId = null)
        {
            return await _reportingRepository.GetAssetStatusReportAsync(facilityId);
        }

        public async Task<List<ManifestStatusReport>> GetManifestStatusReportAsync(int? electionId = null)
        {
            return await _reportingRepository.GetManifestStatusReportAsync(electionId);
        }
    }
}
