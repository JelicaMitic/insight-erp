public class Invoice
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public decimal Tax { get; set; }
    public string Status { get; set; } = "Pending";

    public Order Order { get; set; } = null!;
}
