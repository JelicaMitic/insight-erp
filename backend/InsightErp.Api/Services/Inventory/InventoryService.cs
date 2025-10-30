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
                    Price = wp.Product.Price,
                    StockQuantity = wp.StockQuantity,
                    MinQuantity = wp.MinQuantity

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
                    StockQuantity = 0,
                    MinQuantity = dto.MinQuantity ?? 10
                };
                warehouse.WarehouseProducts.Add(wp);
            }

            if (dto.QuantityChange != 0)
            {
                var newQuantity = wp.StockQuantity + dto.QuantityChange;
                if (newQuantity < 0) return false;
                wp.StockQuantity = newQuantity;
            }

            if (dto.MinQuantity.HasValue)
            {
                wp.MinQuantity = dto.MinQuantity.Value;
            }

            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<List<ProductListItemDto>> GetLowStockAsync(CancellationToken ct)
        {
            var lowStock = await _db.WarehouseProducts
                .Include(wp => wp.Product)
                .Where(wp => wp.StockQuantity < wp.MinQuantity)
                .AsNoTracking()
                .ToListAsync(ct);

            return lowStock.Select(wp => new ProductListItemDto
            {
                Id = wp.Product.Id,
                Name = wp.Product.Name,
                Price = wp.Product.Price,
                StockQuantity = wp.StockQuantity,
                MinQuantity = wp.MinQuantity
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
                    Price = wp.Product.Price,
                    StockQuantity = wp.StockQuantity,
                    MinQuantity = wp.MinQuantity
                }).ToList()
            };
        }
    }
}
