using InsightErp.Api.Models.Orders;

namespace InsightErp.Api.Services.Invoices;
public interface IInvoicesService
{
    Task<InvoiceDto?> GenerateInvoiceAsync(int orderId, CancellationToken ct = default);
    Task<List<InvoiceDto>> GetInvoicesAsync(CancellationToken ct = default);
    Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken ct = default);
}
