using System.Threading.Tasks;

namespace AVIDLogistics.Application.Interfaces
{
    public interface INotificationGateway
    {
        Task NotifyWarehouseAsync(string message);
        Task NotifyLogisticsAsync(string message);
        Task NotifyElectionStatusAsync(int electionId, string status);
    }
}

