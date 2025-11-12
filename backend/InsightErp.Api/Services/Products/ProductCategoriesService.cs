using InsightErp.Api.Data;
using InsightErp.Api.Models.Products;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Services.Products;

public class ProductCategoriesService : IProductCategoriesService
{
    private readonly AppDbContext _db;

    public ProductCategoriesService(AppDbContext db) => _db = db;

    public async Task<List<ProductCategory>> GetAllAsync(CancellationToken ct = default)
        => await _db.ProductCategories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

    public async Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _db.ProductCategories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<ProductCategory> CreateAsync(ProductCategory category, CancellationToken ct = default)
    {
        if (await _db.ProductCategories.AnyAsync(c => c.Name == category.Name, ct))
            throw new InvalidOperationException("Kategorija sa tim nazivom već postoji.");

        _db.ProductCategories.Add(category);
        await _db.SaveChangesAsync(ct);
        return category;
    }

    public async Task<ProductCategory?> UpdateAsync(int id, ProductCategory category, CancellationToken ct = default)
    {
        var existing = await _db.ProductCategories.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (existing == null) return null;

        if (!string.Equals(existing.Name, category.Name, StringComparison.OrdinalIgnoreCase) &&
            await _db.ProductCategories.AnyAsync(c => c.Name == category.Name, ct))
            throw new InvalidOperationException("Kategorija sa tim nazivom već postoji.");

        existing.Name = category.Name;
        await _db.SaveChangesAsync(ct);
        return existing;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var existing = await _db.ProductCategories.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (existing == null) return false;

        _db.ProductCategories.Remove(existing);
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
