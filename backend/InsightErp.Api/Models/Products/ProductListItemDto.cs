using System.ComponentModel.DataAnnotations;

namespace InsightErp.Api.Models.Products;

public class ProductListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}

public class ProductDetailedDto : ProductListItemDto
{
    public Dictionary<string, object>? Attributes { get; set; }
}

public class CreateProductDto
{
    [Required(ErrorMessage = "Naziv proizvoda je obavezan.")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Cena proizvoda je obavezna.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Cena mora biti veæa od nule.")]
    public decimal Price { get; set; }

    public string? Description { get; set; }
    public Dictionary<string, object>? Attributes { get; set; }
}

public class UpdateProductDto : CreateProductDto { }
