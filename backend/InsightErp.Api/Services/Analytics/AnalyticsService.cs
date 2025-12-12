using InsightErp.Api.Data;
using MongoDB.Driver;
using Microsoft.EntityFrameworkCore;
using System.Linq;


public interface IAnalyticsService
{
    Task<AnalyticsOverviewDto> GetOverviewAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<AnalyticsOverviewDto> GetOverviewPresetAsync(int days, CancellationToken ct = default); 
    Task<List<SalesTrendPointDto>> GetSalesTrendAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<WarehouseSalesDto>> GetSalesByWarehouseAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int take = 10, CancellationToken ct = default);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly MongoContext _mongo;
    private readonly RedisCacheService _cache;
    private readonly AppDbContext _db;

    public AnalyticsService(MongoContext mongo, RedisCacheService cache, AppDbContext db)
    { _mongo = mongo; _cache = cache; _db = db; }

    public async Task<AnalyticsOverviewDto> GetOverviewPresetAsync(int days, CancellationToken ct = default)
    {
        var key = $"analytics:preset:{days}d";
        var cached = await _cache.GetAsync<AnalyticsOverviewDto>(key);

        
        var to = DateTime.UtcNow.Date;
        var from = to.AddDays(-days);

        if (cached != null)
        {
           
            cached.From = from;
            cached.To = to;

            
            cached.LowStockCount = await _db.WarehouseProducts
                .CountAsync(x => x.StockQuantity <= x.MinQuantity, ct);

            if (cached.AverageOrderValue == 0 && cached.TotalOrders > 0)
                cached.AverageOrderValue = cached.TotalSales / cached.TotalOrders;

            return cached;
        }

        return await GetOverviewAsync(from, to, ct);
    }


    public async Task<AnalyticsOverviewDto> GetOverviewAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var key = $"analytics:overview:{from:yyyyMMdd}:{to:yyyyMMdd}";
        var cached = await _cache.GetAsync<AnalyticsOverviewDto>(key);
        if (cached != null) return cached;

        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

        var uniqueCustomers = await _db.Orders
            .Where(x => x.Date >= from && x.Date <= to)
            .Select(x => x.CustomerId)
            .Distinct()
            .CountAsync(ct);

        var dto = new AnalyticsOverviewDto
        {
            From = from,
            To = to,
            TotalSales = docs.Sum(x => x.TotalSales),
            TotalOrders = docs.Sum(x => x.TotalOrders),
            UniqueCustomers = uniqueCustomers,
            LowStockCount = await _db.WarehouseProducts.CountAsync(x => x.StockQuantity <= x.MinQuantity, ct)
        };

        dto.AverageOrderValue = dto.TotalOrders > 0
            ? dto.TotalSales / dto.TotalOrders
            : 0m;

        await _cache.SetAsync(key, dto, TimeSpan.FromHours(12));
        return dto;
    }


    public async Task<List<SalesTrendPointDto>> GetSalesTrendAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var key = $"analytics:trend:{from:yyyyMMdd}:{to:yyyyMMdd}";
        var cached = await _cache.GetAsync<List<SalesTrendPointDto>>(key);
        if (cached != null) return cached;

        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).SortBy(x => x.Date).ToListAsync(ct);
        var trend = docs.Select(d => new SalesTrendPointDto { Date = d.Date, Sales = d.TotalSales }).ToList();

        await _cache.SetAsync(key, trend, TimeSpan.FromHours(24));
        return trend;
    }

    public async Task<List<WarehouseSalesDto>> GetSalesByWarehouseAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

        return docs.SelectMany(d => d.SalesByWarehouse)
                   .GroupBy(x => new { x.WarehouseId, x.Name })
                   .Select(g => new WarehouseSalesDto
                   {
                       WarehouseId = g.Key.WarehouseId,
                       WarehouseName = g.Key.Name,
                       Revenue = g.Sum(x => x.Revenue)
                   })
                   .OrderByDescending(x => x.Revenue)
                   .ToList();
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int take = 10, CancellationToken ct = default)
    {
        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

        return docs.SelectMany(d => d.TopProducts)
                   .GroupBy(x => new { x.ProductId, x.Name })
                   .Select(g => new TopProductDto
                   {
                       ProductId = g.Key.ProductId,
                       Name = g.Key.Name,
                       Quantity = g.Sum(x => x.Quantity),
                       Revenue = g.Sum(x => x.Revenue)
                   })
                   .OrderByDescending(x => x.Revenue)
                   .Take(take)
                   .ToList();
    }
}
