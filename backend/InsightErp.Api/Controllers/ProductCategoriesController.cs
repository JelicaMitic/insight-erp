using InsightErp.Api.Models.Products;
using InsightErp.Api.Services;
using InsightErp.Api.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductCategoriesController : ControllerBase
{
    private readonly IProductCategoriesService _svc;

    public ProductCategoriesController(IProductCategoriesService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<List<ProductCategory>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductCategory>> GetById(int id, CancellationToken ct)
    {
        var cat = await _svc.GetByIdAsync(id, ct);
        return cat == null ? NotFound() : Ok(cat);
    }

    [HttpPost]
    public async Task<ActionResult<ProductCategory>> Create([FromBody] ProductCategory category, CancellationToken ct)
    {
        try
        {
            var created = await _svc.CreateAsync(category, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductCategory>> Update(int id, [FromBody] ProductCategory category, CancellationToken ct)
    {
        try
        {
            var updated = await _svc.UpdateAsync(id, category, ct);
            return updated == null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _svc.DeleteAsync(id, ct);
        return deleted ? Ok() : NotFound();
    }
}
