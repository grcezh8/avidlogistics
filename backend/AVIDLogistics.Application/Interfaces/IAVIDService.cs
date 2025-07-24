using System.Threading.Tasks;
using AVIDLogistics.Application.DTOs;

namespace AVIDLogistics.Application.Interfaces
{
    public interface IAVIDService
    {
        Task<bool> ValidatePollSiteAsync(int pollSiteId);
        Task<PollSiteInfo> GetPollSiteInfoAsync(int pollSiteId);
        Task NotifyElectionStatusAsync(int electionId, string status);
    }
}

