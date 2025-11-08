using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _svc;
    private readonly IAnalyticsEtlService _etl;

    public AnalyticsController(IAnalyticsService svc, IAnalyticsEtlService etl)
    { _svc = svc; _etl = etl; }

    private static (DateTime from, DateTime to) ResolvePresetUtc(int days)
    {
        var to = DateTime.UtcNow.Date;        
        var from = to.AddDays(-days);
        return (from, to);
    }

    [HttpGet("overview")]
    public async Task<AnalyticsOverviewDto> Overview(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? preset,
        CancellationToken ct)
    {
        if (preset is 7 or 30 or 365)
            return await _svc.GetOverviewPresetAsync(preset.Value, ct);

        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");

        return await _svc.GetOverviewAsync(from.Value, to.Value, ct);
    }

    [HttpGet("sales-trend")]
    public async Task<List<SalesTrendPointDto>> Trend(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? preset,
        CancellationToken ct)
    {
        if (preset is 7 or 30 or 365)
        {
            var (pf, pt) = ResolvePresetUtc(preset.Value);
            return await _svc.GetSalesTrendAsync(pf, pt, ct);
        }
        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");
        return await _svc.GetSalesTrendAsync(from.Value, to.Value, ct);
    }

    [HttpGet("by-warehouse")]
    public async Task<List<WarehouseSalesDto>> ByWarehouse(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? preset,
        CancellationToken ct)
    {
        if (preset is 7 or 30 or 365)
        {
            var (pf, pt) = ResolvePresetUtc(preset.Value);
            return await _svc.GetSalesByWarehouseAsync(pf, pt, ct);
        }
        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");
        return await _svc.GetSalesByWarehouseAsync(from.Value, to.Value, ct);
    }

    [HttpGet("top-products")]
    public async Task<List<TopProductDto>> TopProducts(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? preset,
        [FromQuery] int take = 10,
        CancellationToken ct = default)
    {
        if (preset is 7 or 30 or 365)
        {
            var (pf, pt) = ResolvePresetUtc(preset.Value);
            return await _svc.GetTopProductsAsync(pf, pt, take, ct);
        }
        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");
        return await _svc.GetTopProductsAsync(from.Value, to.Value, take, ct);
    }

    [HttpPost("etl/run")]
    [Authorize(Roles = "Admin")] 
    public async Task<object> RunEtl([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, CancellationToken ct = default)
    {
        int written = (from.HasValue && to.HasValue)
            ? await _etl.RunAsync(from.Value.Date, to.Value.Date, ct)
            : await _etl.RunYesterdayAsync(ct);
        return new { written };
    }
}
