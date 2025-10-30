namespace InsightErp.Api.Models.Inventory;

public class UpdateStockDto
{
    public int ProductId { get; set; }
    public int QuantityChange { get; set; }
    public int? MinQuantity { get; set; }
}