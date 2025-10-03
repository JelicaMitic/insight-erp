namespace InsightErp.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;


}
