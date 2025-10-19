using InsightErp.Api.Data;
using InsightErp.Api.Models.Inventory;
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
                .Include(w => w.WarehouseProducts)
                    .ThenInclude(wp => wp.Product)
                .AsNoTracking()
                .ToListAsync(ct);

            return warehouses.Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Location = w.Location,
                Products = w.WarehouseProducts.Select(wp => new ProductListItemDto
                {
                    Id = wp.Product.Id,
                    Name = wp.Product.Name,
                    Price = wp.Product.Price
                }).ToList()
            }).ToList();
        }

        public async Task<bool> UpdateStockAsync(int warehouseId, UpdateStockDto dto, CancellationToken ct)
        {
            var warehouse = await _db.Warehouses
                .Include(w => w.WarehouseProducts)
                .FirstOrDefaultAsync(w => w.Id == warehouseId, ct);

            if (warehouse == null) return false;

            var wp = warehouse.WarehouseProducts.FirstOrDefault(x => x.ProductId == dto.ProductId);
            if (wp == null)
            {
                wp = new WarehouseProduct
                {
                    WarehouseId = warehouseId,
                    ProductId = dto.ProductId,
                    StockQuantity = 0
                };
                warehouse.WarehouseProducts.Add(wp);
            }

            var newQuantity = wp.StockQuantity + dto.QuantityChange;
            if (newQuantity < 0) return false;

            wp.StockQuantity = newQuantity;
            await _db.SaveChangesAsync(ct);

            return true;
        }

        public async Task<List<ProductListItemDto>> GetLowStockAsync(int threshold, CancellationToken ct)
        {
            var lowStock = await _db.WarehouseProducts
                .Include(wp => wp.Product)
                .Where(wp => wp.StockQuantity < threshold)
                .AsNoTracking()
                .ToListAsync(ct);

            return lowStock.Select(wp => new ProductListItemDto
            {
                Id = wp.Product.Id,
                Name = wp.Product.Name,
                Price = wp.Product.Price
            }).ToList();
        }

        public async Task<WarehouseDto?> GetByIdAsync(int id, CancellationToken ct)
        {
            var warehouse = await _db.Warehouses
                .Include(w => w.WarehouseProducts)
                    .ThenInclude(wp => wp.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Id == id, ct);

            if (warehouse == null)
                return null;

            return new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Location = warehouse.Location,
                Products = warehouse.WarehouseProducts.Select(wp => new ProductListItemDto
                {
                    Id = wp.Product.Id,
                    Name = wp.Product.Name,
                    Price = wp.Product.Price
                }).ToList()
            };
        }
    }
}
