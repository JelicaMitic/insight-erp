using InsightErp.Api.Models.Orders;
using InsightErp.Api.Services.Invoices;
using InsightErp.Api.Services.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoicesService _svc;
    public InvoicesController(IInvoicesService svc) => _svc = svc;

    [HttpPost("{orderId:int}")]
    [Authorize(Roles = "Admin,Referent")]
    public async Task<ActionResult<InvoiceDto>> Generate(int orderId, CancellationToken ct)
    {
        try
        {
            var dto = await _svc.GenerateInvoiceAsync(orderId, ct);
            return dto == null ? NotFound() : Ok(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<List<InvoiceDto>>> GetAll(CancellationToken ct)
        => Ok(await _svc.GetInvoicesAsync(ct));

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id, CancellationToken ct)
    {
        var dto = await _svc.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }
   
    [HttpGet("{id:int}/pdf")]
    [Authorize(Roles = "Admin,Referent,Menadzer")]
    public async Task<IActionResult> GetPdf(int id, CancellationToken ct)
    {
        var invoice = await _svc.GetByIdAsync(id, ct);
        if (invoice == null) return NotFound();

        var pdf = PdfGenerator.GenerateInvoicePdf(invoice);
        return File(pdf, "application/pdf", $"Invoice_{invoice.Id}.pdf");
    }


}
