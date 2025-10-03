using InsightErp.Api.Models.Products;

public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Location { get; set; } = null!;
    public List<ProductListItemDto> Products { get; set; } = new();
}
