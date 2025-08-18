using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Serilog;
using AVIDLogistics.Infrastructure.Data;
using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Infrastructure.Repositories;
using AVIDLogistics.Infrastructure.Services;
using AVIDLogistics.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/avidlogistics-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework
builder.Services.AddDbContext<WarehouseDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AVIDLogisticsDatabase")));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-super-secret-jwt-key-that-is-at-least-32-characters-long";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register Repositories (both interfaces and concrete classes for controllers)
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<ActivityRepository>();
builder.Services.AddScoped<IAlertsRepository, AlertsRepository>();
builder.Services.AddScoped<AlertsRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<AssetRepository>();
builder.Services.AddScoped<IAuditSessionRepository, AuditSessionRepository>();
builder.Services.AddScoped<AuditSessionRepository>();
builder.Services.AddScoped<IChainOfCustodyRepository, ChainOfCustodyRepository>();
builder.Services.AddScoped<ChainOfCustodyRepository>();
builder.Services.AddScoped<ICoCFormStatusRepository, CoCFormStatusRepository>();
builder.Services.AddScoped<CoCFormStatusRepository>();
builder.Services.AddScoped<IDeliveryManifestRepository, DeliveryManifestRepository>();
builder.Services.AddScoped<DeliveryManifestRepository>();
builder.Services.AddScoped<IElectionRepository, ElectionRepository>();
builder.Services.AddScoped<ElectionRepository>();
builder.Services.AddScoped<IFacilityRepository, FacilityRepository>();
builder.Services.AddScoped<FacilityRepository>();
builder.Services.AddScoped<IKitRepository, KitRepository>();
builder.Services.AddScoped<KitRepository>();
builder.Services.AddScoped<IManifestItemRepository, ManifestItemRepository>();
builder.Services.AddScoped<ManifestItemRepository>();
builder.Services.AddScoped<IManifestRepository, ManifestRepository>();
builder.Services.AddScoped<ManifestRepository>();
builder.Services.AddScoped<IPollSiteRepository, PollSiteRepository>();
builder.Services.AddScoped<PollSiteRepository>();
builder.Services.AddScoped<IReportingRepository, ReportingRepository>();
builder.Services.AddScoped<ReportingRepository>();
builder.Services.AddScoped<IScannedFormRepository, ScannedFormRepository>();
builder.Services.AddScoped<ScannedFormRepository>();
builder.Services.AddScoped<ISealRepository, SealRepository>();
builder.Services.AddScoped<SealRepository>();
builder.Services.AddScoped<ISignatureRepository, SignatureRepository>();
builder.Services.AddScoped<SignatureRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<INotificationGateway, NotificationGateway>();
// builder.Services.AddScoped<IManifestService, ManifestService>(); // Commented out due to interface mismatch
builder.Services.AddScoped<CoCFormGenerationService>();
builder.Services.AddScoped<CoCNotificationService>();

// Register Use Cases - only register classes that exist
// Note: Use case registrations can be added later as needed

// Register OCR Service - commented out due to missing interface
// builder.Services.AddScoped<IOcrService, OcrService>();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "AVID Logistics API", 
        Version = "v1",
        Description = "API for AVID Logistics Management System"
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AVID Logistics API V1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Add Health Check endpoint
app.MapHealthChecks("/health");

// Add a simple root endpoint
app.MapGet("/", () => "AVID Logistics API is running!");

try
{
    Log.Information("Starting AVID Logistics API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
