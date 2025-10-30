using InsightErp.Api.Models.Inventory;
using InsightErp.Api.Models.Products;
using InsightErp.Api.Services.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IInventoryService _svc;
    public WarehousesController(IInventoryService svc) => _svc = svc;

    [HttpGet]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<List<WarehouseDto>>> GetAll(CancellationToken ct) =>
        Ok(await _svc.GetAllAsync(ct));

    [HttpPost("{id:int}/stock")]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockDto dto, CancellationToken ct)
    {
        var success = await _svc.UpdateStockAsync(id, dto, ct);
        return success ? Ok() : BadRequest("Stock update failed.");
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WarehouseDto>> GetById(int id, CancellationToken ct)
    {
        var warehouse = await _svc.GetByIdAsync(id, ct);
        if (warehouse == null)
            return NotFound();

        return Ok(warehouse);
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<List<ProductListItemDto>>> GetLowStock(CancellationToken ct)
    => Ok(await _svc.GetLowStockAsync(ct));

}
