using InsightErp.Api.Models.Products;

namespace InsightErp.Api.Services;

public interface IProductsService
{
    Task<List<ProductListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProductDetailedDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDetailedDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailedDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailedDto?> DeleteAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<ProductWarehouseDto>> GetProductStockByWarehouseAsync(int productId);
}
