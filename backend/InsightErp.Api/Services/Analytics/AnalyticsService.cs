using InsightErp.Api.Data;
using MongoDB.Driver;
using Microsoft.EntityFrameworkCore;
using System.Linq;

public interface IAnalyticsService
{
    Task<AnalyticsOverviewDto> GetOverviewAsync(DateTime from, DateTime to, int? warehouseId, CancellationToken ct = default);
    Task<AnalyticsOverviewDto> GetOverviewPresetAsync(int days, int? warehouseId, CancellationToken ct = default);

    Task<List<SalesTrendPointDto>> GetSalesTrendAsync(DateTime from, DateTime to, int? warehouseId, CancellationToken ct = default);

    Task<List<WarehouseSalesDto>> GetSalesByWarehouseAsync(DateTime from, DateTime to, CancellationToken ct = default);

    Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int? warehouseId, int take = 10, CancellationToken ct = default);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly MongoContext _mongo;
    private readonly RedisCacheService _cache;
    private readonly AppDbContext _db;

    public AnalyticsService(MongoContext mongo, RedisCacheService cache, AppDbContext db)
    {
        _mongo = mongo;
        _cache = cache;
        _db = db;
    }

    private static string WhKey(int? warehouseId)
        => warehouseId.HasValue ? $"wh:{warehouseId.Value}" : "wh:all";

    public async Task<AnalyticsOverviewDto> GetOverviewPresetAsync(int days, int? warehouseId, CancellationToken ct = default)
    {
        var to = DateTime.UtcNow.Date;
        var from = to.AddDays(-days);

        if (warehouseId.HasValue)
            return await GetOverviewAsync(from, to, warehouseId, ct);

        var key = $"analytics:preset:{days}d"; 
        var cached = await _cache.GetAsync<AnalyticsOverviewDto>(key);

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

        return await GetOverviewAsync(from, to, null, ct);
    }

    public async Task<AnalyticsOverviewDto> GetOverviewAsync(DateTime from, DateTime to, int? warehouseId, CancellationToken ct = default)
    {
        var key = $"analytics:overview:{from:yyyyMMdd}:{to:yyyyMMdd}:{WhKey(warehouseId)}";
        var cached = await _cache.GetAsync<AnalyticsOverviewDto>(key);
        if (cached != null) return cached;

        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

        decimal totalSales = warehouseId.HasValue
            ? docs.Sum(d => d.SalesByWarehouse?
                .FirstOrDefault(w => w.WarehouseId == warehouseId.Value)?.Revenue ?? 0m)
            : docs.Sum(d => d.TotalSales);

        var ordersQ = _db.Orders.AsQueryable()
            .Where(o => o.Date >= from && o.Date <= to);

        if (warehouseId.HasValue)
            ordersQ = ordersQ.Where(o => o.WarehouseId == warehouseId.Value);

        var totalOrders = await ordersQ.CountAsync(ct);
        var uniqueCustomers = await ordersQ
            .Select(o => o.CustomerId)
            .Distinct()
            .CountAsync(ct);


        var wpQ = _db.WarehouseProducts.AsQueryable();
        if (warehouseId.HasValue)
            wpQ = wpQ.Where(wp => wp.WarehouseId == warehouseId.Value);

        var lowStockCount = await wpQ.CountAsync(x => x.StockQuantity <= x.MinQuantity, ct);

        var dto = new AnalyticsOverviewDto
        {
            From = from,
            To = to,
            TotalSales = totalSales,
            TotalOrders = totalOrders,
            UniqueCustomers = uniqueCustomers,
            LowStockCount = lowStockCount
        };

        dto.AverageOrderValue = dto.TotalOrders > 0 ? dto.TotalSales / dto.TotalOrders : 0m;

        await _cache.SetAsync(key, dto, TimeSpan.FromHours(12));
        return dto;
    }

    public async Task<List<SalesTrendPointDto>> GetSalesTrendAsync(DateTime from, DateTime to, int? warehouseId, CancellationToken ct = default)
    {
        var key = $"analytics:trend:{from:yyyyMMdd}:{to:yyyyMMdd}:{WhKey(warehouseId)}";
        var cached = await _cache.GetAsync<List<SalesTrendPointDto>>(key);
        if (cached != null) return cached;

        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date) &
                     Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates
            .Find(filter)
            .SortBy(x => x.Date)
            .ToListAsync(ct);

        var trend = docs.Select(d =>
        {
            var sales = warehouseId.HasValue
                ? d.SalesByWarehouse?
                    .FirstOrDefault(w => w.WarehouseId == warehouseId.Value)?.Revenue ?? 0m
                : d.TotalSales;

            return new SalesTrendPointDto
            {
                Date = d.Date,
                Sales = sales
            };
        }).ToList();

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

 

    public async Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int? warehouseId, int take = 10, CancellationToken ct = default)
    {
        var key = $"analytics:top:{from:yyyyMMdd}:{to:yyyyMMdd}:{WhKey(warehouseId)}:{take}";
        var cached = await _cache.GetAsync<List<TopProductDto>>(key);
        if (cached != null) return cached;

        var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from.Date)
            & Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, to.Date.AddDays(1));

        var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

        IEnumerable<TopProductEmbedded> items;

        if (!warehouseId.HasValue)
        {
            items = docs.SelectMany(d => d.TopProducts);
        }
        else
        {
            items = docs.SelectMany(d =>
                (d.TopProductsByWarehouse ?? new List<WarehouseTopProductsEmbedded>())
                    .Where(w => w.WarehouseId == warehouseId.Value)
                    .SelectMany(w => w.TopProducts ?? new List<TopProductEmbedded>())
);

        }

        var result = items
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

        await _cache.SetAsync(key, result, TimeSpan.FromHours(24));
        return result;
    }

}
