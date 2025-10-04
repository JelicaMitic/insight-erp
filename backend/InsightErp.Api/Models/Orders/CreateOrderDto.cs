namespace InsightErp.Api.Models.Orders;
public class CreateOrderDto
{
    public int UserId { get; set; }      
    public List<OrderItemCreateDto> Items { get; set; } = new();
}
