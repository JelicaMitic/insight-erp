using InsightErp.Api.Models.Products;
using InsightErp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductsService _svc;
    public ProductsController(IProductsService svc) => _svc = svc;

    [HttpGet]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<List<ProductListItemDto>>> GetAll(CancellationToken ct) =>
        Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<ProductDetailedDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<ProductDetailedDto>> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        try
        {
            var created = await _svc.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<ProductDetailedDto>> Update(int id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _svc.UpdateAsync(id, dto, ct);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<ProductDetailedDto>> Delete(int id, CancellationToken ct)
    {
        var deleted = await _svc.DeleteAsync(id, ct);
        return deleted == null ? NotFound() : Ok(deleted);
    }


    [HttpGet("{id:int}/warehouses")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<IActionResult> GetProductStockByWarehouse(int id)
    {
        var result = await _svc.GetProductStockByWarehouseAsync(id);
        return Ok(result);
    }

}
