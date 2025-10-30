namespace InsightErp.Api.Models.Orders;
public class InvoiceDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public decimal Tax { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal TotalWithTax => Amount + Tax;
    public string CustomerName { get; set; } = null!;
    public DateTime Date { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();

}
