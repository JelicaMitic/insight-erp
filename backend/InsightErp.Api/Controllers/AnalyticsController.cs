using InsightErp.Api.Models.Inventory;
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
        [FromQuery] int? warehouseId,
        CancellationToken ct)
    {
        if (preset is 7 or 30 or 365)
            return await _svc.GetOverviewPresetAsync(preset.Value, warehouseId, ct);

        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");

        return await _svc.GetOverviewAsync(from.Value, to.Value, warehouseId, ct);
    }

    [HttpGet("sales-trend")]
    public async Task<List<SalesTrendPointDto>> Trend(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int? preset,
        [FromQuery] int? warehouseId,
        CancellationToken ct)
    {
        if (preset is 7 or 30 or 365)
        {
            var (pf, pt) = ResolvePresetUtc(preset.Value);
            return await _svc.GetSalesTrendAsync(pf, pt,warehouseId, ct);
        }
        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");
        return await _svc.GetSalesTrendAsync(from.Value, to.Value, warehouseId, ct);
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
        [FromQuery] int? warehouseId,
        [FromQuery] int take = 10,
        CancellationToken ct = default)
    {
        if (preset is 7 or 30 or 365)
        {
            var (pf, pt) = ResolvePresetUtc(preset.Value);
            return await _svc.GetTopProductsAsync(pf, pt, warehouseId, take, ct);
        }
        if (from is null || to is null)
            throw new ArgumentException("Provide either 'preset' (7|30|365) OR both 'from' and 'to'.");
        return await _svc.GetTopProductsAsync(from.Value, to.Value, warehouseId, take, ct);
    }

    [HttpPost("etl/run")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RunEtl(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken ct = default)
    {
        if (from.HasValue != to.HasValue)
            return BadRequest("Both 'from' and 'to' must be provided together.");

        try
        {
            int written = (from.HasValue && to.HasValue)
                ? await _etl.RunAsync(from.Value.Date, to.Value.Date, ct)
                : await _etl.RunYesterdayAsync(ct);

            return Ok(new { written });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

}
