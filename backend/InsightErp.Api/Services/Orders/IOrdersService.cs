using InsightErp.Api.Models.Orders;

namespace InsightErp.Api.Services.Orders;
public interface IOrdersService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, CancellationToken ct = default);
    Task<List<OrderDto>> GetOrdersAsync(CancellationToken ct = default);
    Task<OrderDto?> GetOrderByIdAsync(int id, CancellationToken ct = default);
}
