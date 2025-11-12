using InsightErp.Api.Models.Products;

namespace InsightErp.Api.Services.Products;

public interface IProductCategoriesService
{
    Task<List<ProductCategory>> GetAllAsync(CancellationToken ct = default);
    Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductCategory> CreateAsync(ProductCategory category, CancellationToken ct = default);
    Task<ProductCategory?> UpdateAsync(int id, ProductCategory category, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
