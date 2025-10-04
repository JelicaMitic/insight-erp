using InsightErp.Api.Data;
using InsightErp.Api.Models.Orders;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Services.Invoices;

public class InvoicesService : IInvoicesService
{
    private readonly AppDbContext _db;
    private const decimal TaxRate = 0.20m; // 20% PDV

    public InvoicesService(AppDbContext db) => _db = db;

    public async Task<InvoiceDto?> GenerateInvoiceAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
            .Include(o => o.Invoice)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order == null) return null;

        if (order.Invoice != null)
            throw new InvalidOperationException("Invoice already exists for this order.");

        var amount = order.TotalAmount;
        var tax = Math.Round(amount * TaxRate, 2);

        var invoice = new Invoice
        {
            OrderId = order.Id,
            Amount = amount,
            Tax = tax,
            Status = "Issued"
        };

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return new InvoiceDto
        {
            Id = invoice.Id,
            OrderId = invoice.OrderId,
            Amount = invoice.Amount,
            Tax = invoice.Tax,
            Status = invoice.Status
        };
    }

    public async Task<List<InvoiceDto>> GetInvoicesAsync(CancellationToken ct = default)
    {
        var list = await _db.Invoices.AsNoTracking()
            .OrderByDescending(i => i.Id)
            .ToListAsync(ct);

        return list.Select(i => new InvoiceDto
        {
            Id = i.Id,
            OrderId = i.OrderId,
            Amount = i.Amount,
            Tax = i.Tax,
            Status = i.Status
        }).ToList();
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var i = await _db.Invoices.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (i == null) return null;

        return new InvoiceDto
        {
            Id = i.Id,
            OrderId = i.OrderId,
            Amount = i.Amount,
            Tax = i.Tax,
            Status = i.Status
        };
    }
}
