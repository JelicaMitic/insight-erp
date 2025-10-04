using InsightErp.Api.Models.Orders;
using InsightErp.Api.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrdersService _svc;
    public OrdersController(IOrdersService svc) => _svc = svc;

    [HttpPost]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        try
        {
            var created = await _svc.CreateOrderAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<List<OrderDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetOrdersAsync(ct));

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<OrderDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetOrderByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }
}
