using InsightErp.Api.Models;
using InsightErp.Api.Models.Products;

namespace InsightErp.Api.Models.Inventory;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Location { get; set; } = null!;

    public ICollection<WarehouseProduct> WarehouseProducts { get; set; } = new List<WarehouseProduct>();
}
