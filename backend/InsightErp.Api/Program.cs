using InsightErp.Api.Data;
using InsightErp.Api.Services;
using InsightErp.Api.Services.Auth;
using InsightErp.Api.Services.Security;
using InsightErp.Api.Services.Inventory;
using InsightErp.Api.Services.Orders;
using InsightErp.Api.Services.Invoices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using StackExchange.Redis;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<MongoContext>();

// Servisi
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductsService, ProductsService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IOrdersService, OrdersService>();
builder.Services.AddScoped<IInvoicesService, InvoicesService>();
builder.Services.AddScoped<IAnalyticsEtlService, AnalyticsEtlService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddHostedService<AnalyticsEtlHostedService>();



// Auth
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// Swagger;Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "InsightErp API", Version = "v1" });

    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173") 
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// 1) Izvuci vrednost iz više mogućih mesta
var redisConn =
    builder.Configuration.GetConnectionString("RedisConnection")                   // appsettings: ConnectionStrings.RedisConnection
    ?? builder.Configuration.GetConnectionString("Redis")                          // (ako si negde koristila ovaj ključ)
    ?? builder.Configuration["ConnectionStrings:RedisConnection"]                  // eksplicitna putanja
    ?? builder.Configuration["Redis:Configuration"]                                // alternativni key
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__RedisConnection")    // env var (ASP.NET pattern)
    ?? Environment.GetEnvironmentVariable("REDIS_CONNECTION");                     // custom env var

Console.WriteLine($"[BOOT] Redis connection: '{redisConn ?? "<NULL>"}'");

// 2) Registruj Redis ili fallback na memorijski keš da app ne puca u dev-u
if (!string.IsNullOrWhiteSpace(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(o =>
    {
        o.Configuration = redisConn;
        o.InstanceName = "insighterp:"; // opcionalno
    });
}
else
{
    Console.WriteLine("[BOOT] Redis connection is NULL -> using in-memory cache fallback");
    builder.Services.AddDistributedMemoryCache();
}
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var conn = redisConn;
    // fallback tako da ne puca (npr. pri 'dotnet ef') ako Redis nije up
    if (string.IsNullOrWhiteSpace(conn))
        conn = "localhost:6379,abortConnect=false";

    return ConnectionMultiplexer.Connect(conn);
});
builder.Services.AddSingleton<RedisCacheService>();


builder.Services.AddControllers();

var app = builder.Build();

QuestPDF.Settings.License = LicenseType.Community;

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    
    await Seed.EnsureAdminAsync(db);
}

app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
