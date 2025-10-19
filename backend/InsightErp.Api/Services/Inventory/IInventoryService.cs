using InsightErp.Api.Models.Products;
using InsightErp.Api.Models.Inventory;

public interface IInventoryService
{
    Task<List<WarehouseDto>> GetAllAsync(CancellationToken ct);
    Task<bool> UpdateStockAsync(int warehouseId, UpdateStockDto dto, CancellationToken ct);
    Task<List<ProductListItemDto>> GetLowStockAsync(int threshold, CancellationToken ct);
    Task<WarehouseDto?> GetByIdAsync(int id, CancellationToken ct);

}
