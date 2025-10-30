namespace InsightErp.Api.Models.Orders;
public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalAmount { get; set; }
    public string? InvoiceStatus { get; set; }
    public string? CustomerName { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public int? InvoiceId { get; set; }


}
