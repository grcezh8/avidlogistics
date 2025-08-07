using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;

namespace AVIDLogistics.Application.Services
{
    public class CoCNotificationService
    {
        private readonly ICoCFormStatusRepository _cocFormStatusRepository;
        private readonly INotificationGateway _notificationGateway;

        public CoCNotificationService(
            ICoCFormStatusRepository cocFormStatusRepository,
            INotificationGateway notificationGateway)
        {
            _cocFormStatusRepository = cocFormStatusRepository;
            _notificationGateway = notificationGateway;
        }

        public async Task CheckAndNotifyOverdueSignaturesAsync()
        {
            try
            {
                // Get all unresolved forms
                var unresolvedForms = await _cocFormStatusRepository.GetUnresolvedFormsAsync();
                var now = DateTime.UtcNow;

                // Find forms that are overdue (past expiration or taking too long)
                var overdueForms = unresolvedForms.Where(f => 
                    (f.ExpiresAt.HasValue && f.ExpiresAt.Value < now) || // Expired forms
                    (f.CreatedAt.AddHours(24) < now && f.CompletedSignatures == 0) || // No signatures after 24 hours
                    (f.CreatedAt.AddHours(48) < now && f.CompletedSignatures < f.RequiredSignatures) // Incomplete after 48 hours
                ).ToList();

                foreach (var form in overdueForms)
                {
                    await SendOverdueNotificationAsync(form);
                }

                // Also check for forms expiring soon (within 4 hours)
                var expiringSoonForms = unresolvedForms.Where(f =>
                    f.ExpiresAt.HasValue && 
                    f.ExpiresAt.Value > now && 
                    f.ExpiresAt.Value < now.AddHours(4) &&
                    f.CompletedSignatures < f.RequiredSignatures
                ).ToList();

                foreach (var form in expiringSoonForms)
                {
                    await SendExpiringNotificationAsync(form);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw to prevent disrupting other processes
                Console.WriteLine($"Error in CoC notification service: {ex.Message}");
            }
        }

        private async Task SendOverdueNotificationAsync(CoCFormStatus form)
        {
            var message = $"Chain of Custody form for Manifest {form.ManifestId} is overdue. " +
                         $"Status: {form.CompletedSignatures}/{form.RequiredSignatures} signatures completed. " +
                         $"Form URL: {form.FormUrl}";

            await _notificationGateway.NotifyWarehouseAsync(message);
        }

        private async Task SendExpiringNotificationAsync(CoCFormStatus form)
        {
            var hoursUntilExpiry = form.ExpiresAt.HasValue 
                ? (form.ExpiresAt.Value - DateTime.UtcNow).TotalHours 
                : 0;

            var message = $"Chain of Custody form for Manifest {form.ManifestId} expires in {hoursUntilExpiry:F1} hours. " +
                         $"Status: {form.CompletedSignatures}/{form.RequiredSignatures} signatures completed. " +
                         $"Form URL: {form.FormUrl}";

            await _notificationGateway.NotifyWarehouseAsync(message);
        }

        public async Task<List<string>> GetOverdueAlertsAsync()
        {
            var alerts = new List<string>();
            
            try
            {
                var unresolvedForms = await _cocFormStatusRepository.GetUnresolvedFormsAsync();
                var expiredForms = await _cocFormStatusRepository.GetExpiredFormsAsync();
                var now = DateTime.UtcNow;

                // Expired forms
                foreach (var form in expiredForms)
                {
                    alerts.Add($"EXPIRED: Manifest {form.ManifestId} CoC form expired on {form.ExpiresAt:yyyy-MM-dd HH:mm}");
                }

                // Forms with no signatures after 24 hours
                var noSignatureForms = unresolvedForms.Where(f => 
                    f.CreatedAt.AddHours(24) < now && f.CompletedSignatures == 0).ToList();
                
                foreach (var form in noSignatureForms)
                {
                    var hoursOld = (now - form.CreatedAt).TotalHours;
                    alerts.Add($"NO SIGNATURES: Manifest {form.ManifestId} has no signatures after {hoursOld:F0} hours");
                }

                // Incomplete forms after 48 hours
                var incompleteForms = unresolvedForms.Where(f => 
                    f.CreatedAt.AddHours(48) < now && 
                    f.CompletedSignatures > 0 && 
                    f.CompletedSignatures < f.RequiredSignatures).ToList();
                
                foreach (var form in incompleteForms)
                {
                    var hoursOld = (now - form.CreatedAt).TotalHours;
                    alerts.Add($"INCOMPLETE: Manifest {form.ManifestId} has {form.CompletedSignatures}/{form.RequiredSignatures} signatures after {hoursOld:F0} hours");
                }

                // Forms expiring within 4 hours
                var expiringSoon = unresolvedForms.Where(f =>
                    f.ExpiresAt.HasValue && 
                    f.ExpiresAt.Value > now && 
                    f.ExpiresAt.Value < now.AddHours(4) &&
                    f.CompletedSignatures < f.RequiredSignatures).ToList();

                foreach (var form in expiringSoon)
                {
                    var hoursUntilExpiry = (form.ExpiresAt.Value - now).TotalHours;
                    alerts.Add($"EXPIRING SOON: Manifest {form.ManifestId} expires in {hoursUntilExpiry:F1} hours");
                }
            }
            catch (Exception ex)
            {
                alerts.Add($"Error retrieving CoC alerts: {ex.Message}");
            }

            return alerts;
        }
    }
}
