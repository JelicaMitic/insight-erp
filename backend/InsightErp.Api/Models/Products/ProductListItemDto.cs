namespace InsightErp.Api.Models.Products;

public class ProductListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? Description { get; set; }
}

public class ProductDetailedDto : ProductListItemDto
{
    public Dictionary<string, object>? Attributes { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; } = 0;
    public string? Description { get; set; }
    public Dictionary<string, object>? Attributes { get; set; }
}

public class UpdateProductDto : CreateProductDto { }
