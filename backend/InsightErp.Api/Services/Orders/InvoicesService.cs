using InsightErp.Api.Data;
using InsightErp.Api.Models.Orders;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Services.Invoices;

public class InvoicesService : IInvoicesService
{
    private readonly AppDbContext _db;
    private const decimal TaxRate = 0.20m; 

    public InvoicesService(AppDbContext db) => _db = db;

    public async Task<InvoiceDto?> GenerateInvoiceAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _db.Orders
           .Include(o => o.Items).ThenInclude(i => i.Product)
           .Include(o => o.Customer)
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
            Status = invoice.Status,
            CustomerName = order.Customer.Name,
            Date = order.Date,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.UnitPrice * i.Quantity
            }).ToList()
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
        var i = await _db.Invoices
            .Include(inv => inv.Order)
                .ThenInclude(o => o.Customer)
            .Include(inv => inv.Order)
                .ThenInclude(o => o.Items)
                    .ThenInclude(it => it.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (i == null || i.Order == null) return null;

        return new InvoiceDto
        {
            Id = i.Id,
            OrderId = i.OrderId,
            Amount = i.Amount,
            Tax = i.Tax,
            Status = i.Status,
            CustomerName = i.Order.Customer?.Name ?? "Nepoznato",
            Date = i.Order.Date,
            Items = i.Order.Items.Select(it => new OrderItemDto
            {
                ProductId = it.ProductId,
                ProductName = it.Product.Name,
                Quantity = it.Quantity,
                UnitPrice = it.UnitPrice,
                LineTotal = it.UnitPrice * it.Quantity
            }).ToList()
        };
    }

}
