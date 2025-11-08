using Dapper;
using InsightErp.Api.Data;
using InsightErp.Api.Models.Mongo;
using Microsoft.Data.SqlClient;
using MongoDB.Driver;
using System.Data;


public class AnalyticsEtlService : IAnalyticsEtlService
{
    private readonly IConfiguration _cfg;
    private readonly MongoContext _mongo;
    private readonly RedisCacheService _cache;

    public AnalyticsEtlService(IConfiguration cfg, MongoContext mongo, RedisCacheService cache)
    {
        _cfg = cfg;
        _mongo = mongo;
        _cache = cache;
    }

    public Task<int> RunYesterdayAsync(CancellationToken ct = default)
    {
        var d = DateTime.UtcNow.Date.AddDays(-1);
        return RunAsync(d, d, ct);
    }

    //public async Task<int> RunAsync(DateTime from, DateTime to, CancellationToken ct = default)
    //{
    //    using var sql = new SqlConnection(_cfg.GetConnectionString("DefaultConnection"));
    //    await sql.OpenAsync(ct);

    //    // Očisti Redis keš za analitiku
    //    await _cache.RemoveByPrefixAsync("analytics:");

    //    using var multi = await sql.QueryMultipleAsync(
    //        "dbo.usp_BuildSalesAggregates",
    //        new { From = from.Date, To = to.Date },
    //        commandType: CommandType.StoredProcedure);

    //    var daily = (await multi.ReadAsync<(DateTime SalesDate, decimal TotalSales, int TotalOrders, int UniqueCustomers)>()).ToList();
    //    var byWh = (await multi.ReadAsync<(DateTime SalesDate, int WarehouseId, string WarehouseName, decimal Revenue)>()).ToList();
    //    var top = (await multi.ReadAsync<(DateTime SalesDate, int ProductId, string ProductName, int Quantity, decimal Revenue)>()).ToList();

    //    var etlRunId = DateTime.UtcNow;
    //    var ops = new List<WriteModel<SalesAggregateDocument>>();

    //    foreach (var d in daily)
    //    {
    //        var date = DateTime.SpecifyKind(d.SalesDate.Date, DateTimeKind.Utc);

    //        var salesByWarehouse = byWh
    //            .Where(x => x.SalesDate.Date == date)
    //            .Select(x => new WarehouseSalesEmbedded
    //            {
    //                WarehouseId = x.WarehouseId,
    //                Name = x.WarehouseName,
    //                Revenue = x.Revenue
    //            }).ToList();

    //        var topProducts = top
    //            .Where(t => t.SalesDate.Date == date)
    //            .OrderByDescending(t => t.Revenue)
    //            .Take(10)
    //            .Select(t => new TopProductEmbedded
    //            {
    //                ProductId = t.ProductId,
    //                Name = t.ProductName,
    //                Quantity = t.Quantity,
    //                Revenue = t.Revenue
    //            }).ToList();

    //        var filter = Builders<SalesAggregateDocument>.Filter.Eq(x => x.Date, date);

    //        var update = Builders<SalesAggregateDocument>.Update
    //            .Set(x => x.TotalSales, d.TotalSales)
    //            .Set(x => x.TotalOrders, d.TotalOrders)
    //            .Set(x => x.UniqueCustomers, d.UniqueCustomers)
    //            .Set(x => x.SalesByWarehouse, salesByWarehouse)
    //            .Set(x => x.TopProducts, topProducts)
    //            .Set(x => x.EtlRunId, etlRunId)
    //            .SetOnInsert(x => x.Date, date);

    //        ops.Add(new UpdateOneModel<SalesAggregateDocument>(filter, update) { IsUpsert = true });
    //    }

    //    if (ops.Any())
    //        await _mongo.SalesAggregates.BulkWriteAsync(ops, new BulkWriteOptions { IsOrdered = false }, ct);

    //    Console.WriteLine($"[ETL] Run {etlRunId:u} - Aggregates upserted: {ops.Count}");

    //    // Nakon što se ETL završi, izračunaj presetove (7, 30, 365)
    //    await BuildPresetsAsync(ct);



    //    return ops.Count;
    //}
    public async Task<int> RunAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        using var sql = new SqlConnection(_cfg.GetConnectionString("DefaultConnection"));
        await sql.OpenAsync(ct);

        using var multi = await sql.QueryMultipleAsync(
            "dbo.usp_BuildSalesAggregates",
            new { From = from.Date, To = to.Date },
            commandType: CommandType.StoredProcedure);

        var daily = (await multi.ReadAsync<(DateTime SalesDate, decimal TotalSales, int TotalOrders, int UniqueCustomers)>()).ToList();
        var byWh = (await multi.ReadAsync<(DateTime SalesDate, int WarehouseId, string WarehouseName, decimal Revenue)>()).ToList();
        var top = (await multi.ReadAsync<(DateTime SalesDate, int ProductId, string ProductName, int Quantity, decimal Revenue)>()).ToList();

        var etlRunId = DateTime.UtcNow;
        var ops = new List<WriteModel<SalesAggregateDocument>>();

        foreach (var d in daily)
        {
            var date = DateTime.SpecifyKind(d.SalesDate.Date, DateTimeKind.Utc);

            var salesByWarehouse = byWh
                .Where(x => x.SalesDate.Date == date)
                .Select(x => new WarehouseSalesEmbedded
                {
                    WarehouseId = x.WarehouseId,
                    Name = x.WarehouseName,
                    Revenue = x.Revenue
                }).ToList();

            var topProducts = top
                .Where(t => t.SalesDate.Date == date)
                .OrderByDescending(t => t.Revenue)
                .Take(10)
                .Select(t => new TopProductEmbedded
                {
                    ProductId = t.ProductId,
                    Name = t.ProductName,
                    Quantity = t.Quantity,
                    Revenue = t.Revenue
                }).ToList();

            var filter = Builders<SalesAggregateDocument>.Filter.Eq(x => x.Date, date);

            var update = Builders<SalesAggregateDocument>.Update
                .Set(x => x.TotalSales, d.TotalSales)
                .Set(x => x.TotalOrders, d.TotalOrders)
                .Set(x => x.UniqueCustomers, d.UniqueCustomers)
                .Set(x => x.SalesByWarehouse, salesByWarehouse)
                .Set(x => x.TopProducts, topProducts)
                .Set(x => x.EtlRunId, etlRunId)
                .SetOnInsert(x => x.Date, date);

            ops.Add(new UpdateOneModel<SalesAggregateDocument>(filter, update) { IsUpsert = true });
        }

        if (ops.Any())
            await _mongo.SalesAggregates.BulkWriteAsync(ops, new BulkWriteOptions { IsOrdered = false }, ct);

        Console.WriteLine($"[ETL] Run {etlRunId:u} - Aggregates upserted: {ops.Count}");

        // 👇 OVDE ide purge pa preset build
        await _cache.RemoveByPrefixAsync("analytics:overview:");
        await _cache.RemoveByPrefixAsync("analytics:trend:");
        // (opciono) ako želiš “čisto”: await _cache.RemoveByPrefixAsync("analytics:preset:");

        await BuildPresetsAsync(ct); // popunjava analytics:preset:{7d,30d,365d}

        return ops.Count;
    }

    private async Task BuildPresetsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow.Date;
        var ranges = new[] { 7, 30, 365 };

        foreach (var days in ranges)
        {
            var from = now.AddDays(-days);
            var filter = Builders<SalesAggregateDocument>.Filter.Gte(x => x.Date, from) &
                         Builders<SalesAggregateDocument>.Filter.Lt(x => x.Date, now.AddDays(1));

            var docs = await _mongo.SalesAggregates.Find(filter).ToListAsync(ct);

            var preset = new
            {
                Days = days,
                TotalSales = docs.Sum(x => x.TotalSales),
                TotalOrders = docs.Sum(x => x.TotalOrders),
                UniqueCustomers = docs.Sum(x => x.UniqueCustomers),
                EtlRunId = DateTime.UtcNow
            };

            await _cache.SetAsync($"analytics:preset:{days}d", preset, TimeSpan.FromHours(24));
        }
        

        Console.WriteLine("[ETL] Preset ranges (7d/30d/365d) calculated and cached.");
    }
}
