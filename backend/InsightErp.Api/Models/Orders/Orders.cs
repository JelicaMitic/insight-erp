using InsightErp.Api.Models.Inventory;
using InsightErp.Api.Models.Orders;
using InsightErp.Api.Models.Users;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }   
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }

    public User User { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Invoice? Invoice { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;

}
