using InsightErp.Api.Data;
using InsightErp.Api.Models.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;
    public CustomersController(AppDbContext db) => _db = db;

   
    [HttpPost]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<Customer>> Create([FromBody] CustomerCreateDto dto, CancellationToken ct)
    {
        if (await _db.Customers.AnyAsync(c => c.Email == dto.Email, ct))
            return Conflict(new { message = "Customer with this email already exists." });

        var customer = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
    }


    [HttpGet]
    public async Task<List<Customer>> GetAll(CancellationToken ct)
        => await _db.Customers.AsNoTracking().ToListAsync(ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Customer>> GetById(int id, CancellationToken ct)
    {
        var c = await _db.Customers.FindAsync(new object?[] { id }, ct);
        return c == null ? NotFound() : Ok(c);
    }
}
