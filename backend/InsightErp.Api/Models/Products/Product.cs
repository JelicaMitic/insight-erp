using InsightErp.Api.Models.Inventory;

namespace InsightErp.Api.Models.Products;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public ICollection<WarehouseProduct> WarehouseProducts { get; set; } = new List<WarehouseProduct>();
}

