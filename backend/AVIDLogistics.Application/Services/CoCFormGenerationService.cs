using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Domain.Entities;
using System.Text;

namespace AVIDLogistics.Application.Services
{
    public class CoCFormGenerationService
    {
        private readonly IManifestRepository _manifestRepository;
        private readonly ICoCFormStatusRepository _cocFormStatusRepository;
        private readonly IAssetRepository _assetRepository;
        private readonly IElectionRepository _electionRepository;
        private readonly IPollSiteRepository _pollSiteRepository;
        private readonly IFacilityRepository _facilityRepository;

        public CoCFormGenerationService(
            IManifestRepository manifestRepository,
            ICoCFormStatusRepository cocFormStatusRepository,
            IAssetRepository assetRepository,
            IElectionRepository electionRepository,
            IPollSiteRepository pollSiteRepository,
            IFacilityRepository facilityRepository)
        {
            _manifestRepository = manifestRepository;
            _cocFormStatusRepository = cocFormStatusRepository;
            _assetRepository = assetRepository;
            _electionRepository = electionRepository;
            _pollSiteRepository = pollSiteRepository;
            _facilityRepository = facilityRepository;
        }

        public async Task<CoCFormDto> GenerateDigitalCoCFormAsync(GenerateCoCFormInput input)
        {
            // Get manifest with details
            var manifest = await _manifestRepository.GetByIdAsync(input.ManifestId);
            if (manifest == null)
                throw new ArgumentException($"Manifest with ID {input.ManifestId} not found");

            // Check if form already exists
            var existingForm = await _cocFormStatusRepository.GetByManifestIdAsync(input.ManifestId);
            if (existingForm != null && !existingForm.IsExpired())
            {
                return await BuildCoCFormDtoAsync(existingForm);
            }

            // Generate unique form URL
            var formId = Guid.NewGuid().ToString("N")[..12].ToUpper();
            var baseUrl = input.BaseUrl ?? "https://localhost:5001";
            var formUrl = $"{baseUrl}/coc/form/{formId}";

            // Create form status record
            var expirationDate = DateTime.UtcNow.AddDays(input.ExpirationDays);
            var formStatus = new CoCFormStatus(
                input.ManifestId,
                formUrl,
                input.RequiredSignatures,
                expirationDate);

            await _cocFormStatusRepository.SaveAsync(formStatus);

            // Update manifest with form URL
            // Note: This would require adding a method to update the manifest
            // For now, we'll assume this is handled elsewhere

            return await BuildCoCFormDtoAsync(formStatus);
        }

        public async Task<CoCFormDto> GetCoCFormByUrlAsync(string formUrl)
        {
            var formStatus = await _cocFormStatusRepository.GetByFormUrlAsync(formUrl);
            if (formStatus == null)
                throw new ArgumentException($"CoC form not found for URL: {formUrl}");

            // Record access
            formStatus.RecordAccess();
            await _cocFormStatusRepository.UpdateAsync(formStatus);

            return await BuildCoCFormDtoAsync(formStatus);
        }

        public async Task<string> GenerateFormHtmlAsync(CoCFormDto formData)
        {
            var html = new StringBuilder();
            
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html lang=\"en\">");
            html.AppendLine("<head>");
            html.AppendLine("    <meta charset=\"UTF-8\">");
            html.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
            html.AppendLine($"    <title>Chain of Custody Form - {formData.ManifestNumber}</title>");
            html.AppendLine("    <style>");
            html.AppendLine(GetFormCss());
            html.AppendLine("    </style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            
            // Header
            html.AppendLine("    <div class=\"form-container\">");
            html.AppendLine("        <div class=\"header\">");
            html.AppendLine("            <h1>CHAIN OF CUSTODY FORM</h1>");
            html.AppendLine($"            <h2>Manifest: {formData.ManifestNumber}</h2>");
            html.AppendLine("        </div>");

            // Election and Location Info
            html.AppendLine("        <div class=\"info-section\">");
            html.AppendLine($"            <p><strong>Election:</strong> {formData.ElectionName}</p>");
            html.AppendLine($"            <p><strong>From:</strong> {formData.FromFacility}</p>");
            html.AppendLine($"            <p><strong>To:</strong> {formData.ToPollSite}</p>");
            html.AppendLine($"            <p><strong>Date Generated:</strong> {formData.CreatedAt:yyyy-MM-dd HH:mm}</p>");
            html.AppendLine("            <div class=\"qr-code-section\">");
            html.AppendLine($"                <div id=\"qrcode\" data-url=\"{formData.FormUrl}\"></div>");
            html.AppendLine("                <p class=\"text-sm text-gray-600 mt-2\">Scan QR code to access this form</p>");
            html.AppendLine("            </div>");
            html.AppendLine("        </div>");

            // Assets Table
            html.AppendLine("        <div class=\"assets-section\">");
            html.AppendLine("            <h3>Assets in Transit</h3>");
            html.AppendLine("            <table class=\"assets-table\">");
            html.AppendLine("                <thead>");
            html.AppendLine("                    <tr>");
            html.AppendLine("                        <th>Asset ID</th>");
            html.AppendLine("                        <th>Serial Number</th>");
            html.AppendLine("                        <th>Type</th>");
            html.AppendLine("                        <th>Seal Number</th>");
            html.AppendLine("                    </tr>");
            html.AppendLine("                </thead>");
            html.AppendLine("                <tbody>");
            
            foreach (var item in formData.Items)
            {
                html.AppendLine("                    <tr>");
                html.AppendLine($"                        <td>{item.AssetId}</td>");
                html.AppendLine($"                        <td>{item.AssetSerialNumber ?? "N/A"}</td>");
                html.AppendLine($"                        <td>{item.AssetType ?? "N/A"}</td>");
                html.AppendLine($"                        <td>{item.SealNumber ?? "N/A"}</td>");
                html.AppendLine("                    </tr>");
            }
            
            html.AppendLine("                </tbody>");
            html.AppendLine("            </table>");
            html.AppendLine("        </div>");

            // Signature Section
            html.AppendLine("        <div class=\"signature-section\">");
            html.AppendLine("            <h3>Digital Signatures</h3>");
            
            if (formData.Status == "Completed")
            {
                html.AppendLine("            <div class=\"completed-signatures\">");
                foreach (var signature in formData.Signatures)
                {
                    html.AppendLine("                <div class=\"signature-record\">");
                    html.AppendLine($"                    <p><strong>Signed by:</strong> {signature.SignedBy}</p>");
                    html.AppendLine($"                    <p><strong>Date:</strong> {signature.SignedAt:yyyy-MM-dd HH:mm}</p>");
                    html.AppendLine($"                    <p><strong>Type:</strong> {signature.SignatureType}</p>");
                    html.AppendLine("                </div>");
                }
                html.AppendLine("            </div>");
            }
            else
            {
                html.AppendLine("            <div class=\"signature-form\">");
                html.AppendLine("                <form id=\"cocSignatureForm\">");
                html.AppendLine($"                    <input type=\"hidden\" name=\"manifestId\" value=\"{formData.ManifestId}\" />");
                html.AppendLine("                    <div class=\"form-group\">");
                html.AppendLine("                        <label for=\"signerName\">Your Name:</label>");
                html.AppendLine("                        <input type=\"text\" id=\"signerName\" name=\"signerName\" required />");
                html.AppendLine("                    </div>");
                html.AppendLine("                    <div class=\"form-group\">");
                html.AppendLine("                        <label for=\"signerRole\">Role/Organization:</label>");
                html.AppendLine("                        <input type=\"text\" id=\"signerRole\" name=\"signerRole\" required />");
                html.AppendLine("                    </div>");
                html.AppendLine("                    <div class=\"form-group\">");
                html.AppendLine("                        <canvas id=\"signatureCanvas\" width=\"400\" height=\"200\"></canvas>");
                html.AppendLine("                        <br />");
                html.AppendLine("                        <button type=\"button\" id=\"clearSignature\">Clear Signature</button>");
                html.AppendLine("                    </div>");
                html.AppendLine("                    <button type=\"submit\" id=\"submitSignature\">Submit Signature</button>");
                html.AppendLine("                </form>");
                html.AppendLine("            </div>");
            }
            
            html.AppendLine("        </div>");

            // Status Info
            html.AppendLine("        <div class=\"status-section\">");
            html.AppendLine($"            <p><strong>Status:</strong> {formData.Status}</p>");
            html.AppendLine($"            <p><strong>Signatures:</strong> {formData.CompletedSignatures} of {formData.RequiredSignatures}</p>");
            if (formData.ExpiresAt.HasValue)
            {
                html.AppendLine($"            <p><strong>Expires:</strong> {formData.ExpiresAt.Value:yyyy-MM-dd HH:mm}</p>");
            }
            html.AppendLine("        </div>");

            html.AppendLine("    </div>");
            
            // JavaScript for signature functionality
            html.AppendLine("    <script>");
            html.AppendLine(GetFormJavaScript());
            html.AppendLine("    </script>");
            
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private async Task<CoCFormDto> BuildCoCFormDtoAsync(CoCFormStatus formStatus)
        {
            var manifest = await _manifestRepository.GetByIdAsync(formStatus.ManifestId);
            if (manifest == null)
                throw new ArgumentException($"Manifest not found for form status");

            // Get election details
            var election = await _electionRepository.GetByIdAsync(manifest.ElectionId);

            // Get poll site details
            var pollSite = await _pollSiteRepository.GetByIdAsync(manifest.ToPollSiteId);

            // Get facility details
            var facility = await _facilityRepository.GetByIdAsync(manifest.FromFacilityId);

            // Map manifest items
            var manifestItems = new List<ManifestItemDto>();
            if (manifest.Items != null)
            {
                foreach (var item in manifest.Items)
                {
                    var asset = await _assetRepository.GetByIdAsync(item.AssetId);
                    manifestItems.Add(new ManifestItemDto
                    {
                        ManifestItemId = item.ManifestItemId,
                        AssetId = item.AssetId,
                        AssetSerialNumber = asset?.SerialNumber ?? string.Empty,
                        AssetType = asset?.AssetType ?? string.Empty,
                        SealNumber = item.SealNumber ?? string.Empty
                    });
                }
            }

            var dto = new CoCFormDto
            {
                ManifestId = formStatus.ManifestId,
                ManifestNumber = manifest.ManifestNumber,
                FormUrl = formStatus.FormUrl,
                Status = formStatus.Status,
                RequiredSignatures = formStatus.RequiredSignatures,
                CompletedSignatures = formStatus.CompletedSignatures,
                CreatedAt = formStatus.CreatedAt,
                CompletedAt = formStatus.CompletedAt,
                ExpiresAt = formStatus.ExpiresAt,
                AccessCount = formStatus.AccessCount,
                ElectionName = election?.Name ?? "Unknown Election",
                FromFacility = facility?.Name ?? "Unknown Facility",
                ToPollSite = pollSite?.FacilityName ?? "Unknown Poll Site",
                Items = manifestItems,
                Signatures = new List<SignatureDto>() // TODO: Get from signature repository when needed
            };

            return dto;
        }

        private string GetFormCss()
        {
            return @"
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .form-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { margin: 0; color: #333; font-size: 24px; }
                .header h2 { margin: 10px 0 0 0; color: #666; font-size: 18px; }
                .info-section { margin-bottom: 30px; }
                .info-section p { margin: 8px 0; font-size: 14px; }
                .assets-section { margin-bottom: 30px; }
                .assets-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .assets-table th, .assets-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .assets-table th { background-color: #f8f9fa; font-weight: bold; }
                .signature-section { margin-bottom: 30px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .form-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                #signatureCanvas { border: 1px solid #ddd; cursor: crosshair; }
                button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
                .status-section { border-top: 1px solid #ddd; padding-top: 20px; }
                .completed-signatures { background-color: #d4edda; padding: 15px; border-radius: 4px; }
                .signature-record { margin-bottom: 10px; }
            ";
        }

        private string GetFormJavaScript()
        {
            return @"
                // Signature canvas functionality
                const canvas = document.getElementById('signatureCanvas');
                const ctx = canvas ? canvas.getContext('2d') : null;
                let isDrawing = false;

                if (canvas && ctx) {
                    canvas.addEventListener('mousedown', startDrawing);
                    canvas.addEventListener('mousemove', draw);
                    canvas.addEventListener('mouseup', stopDrawing);
                    canvas.addEventListener('mouseout', stopDrawing);

                    function startDrawing(e) {
                        isDrawing = true;
                        draw(e);
                    }

                    function draw(e) {
                        if (!isDrawing) return;
                        
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.strokeStyle = '#000';
                        
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                    }

                    function stopDrawing() {
                        if (isDrawing) {
                            ctx.beginPath();
                            isDrawing = false;
                        }
                    }

                    document.getElementById('clearSignature').addEventListener('click', function() {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    });
                }

                // Form submission
                const form = document.getElementById('cocSignatureForm');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const signerName = document.getElementById('signerName').value;
                        const signerRole = document.getElementById('signerRole').value;
                        
                        if (!signerName || !signerRole) {
                            alert('Please fill in all required fields.');
                            return;
                        }

                        // Convert canvas to data URL (placeholder for signature image)
                        const signatureData = canvas ? canvas.toDataURL() : null;
                        
                        // Submit signature (this would call your API)
                        submitSignature({
                            signerName: signerName,
                            signerRole: signerRole,
                            signatureData: signatureData
                        });
                    });
                }

                function submitSignature(data) {
                    // Placeholder for API call to submit signature
                    console.log('Submitting signature:', data);
                    alert('Signature submitted successfully!');
                    location.reload();
                }
            ";
        }
    }
}
