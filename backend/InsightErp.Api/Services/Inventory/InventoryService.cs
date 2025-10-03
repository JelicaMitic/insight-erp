using InsightErp.Api.Data;
using InsightErp.Api.Models;
using InsightErp.Api.Models.Products;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Services.Inventory
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _db;

        public InventoryService(AppDbContext db)
        {
            _db = db;
        }

        
        public async Task<List<WarehouseDto>> GetAllAsync(CancellationToken ct)
        {
            var warehouses = await _db.Warehouses
                .Include(w => w.Products)
                .AsNoTracking()
                .ToListAsync(ct);

            return warehouses.Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Location = w.Location,
                Products = w.Products.Select(p => new ProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity
                }).ToList()
            }).ToList();
        }

        // 🔹 Prijem/izdavanje robe
        public async Task<bool> UpdateStockAsync(int warehouseId, UpdateStockDto dto, CancellationToken ct)
        {
            var warehouse = await _db.Warehouses
                .Include(w => w.Products)
                .FirstOrDefaultAsync(w => w.Id == warehouseId, ct);

            if (warehouse == null) return false;

            var product = warehouse.Products.FirstOrDefault(p => p.Id == dto.ProductId);
            if (product == null) return false;

            // Ažuriraj količinu
            var newQuantity = product.StockQuantity + dto.QuantityChange;
            if (newQuantity < 0) return false; // spreči negativne zalihe

            product.StockQuantity = newQuantity;
            await _db.SaveChangesAsync(ct);

            return true;
        }

       
        public async Task<List<ProductListItemDto>> GetLowStockAsync(int threshold, CancellationToken ct)
        {
            var products = await _db.Products
                .Where(p => p.StockQuantity < threshold)
                .AsNoTracking()
                .ToListAsync(ct);

            return products.Select(p => new ProductListItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                StockQuantity = p.StockQuantity
            }).ToList();
        }
    }
}
