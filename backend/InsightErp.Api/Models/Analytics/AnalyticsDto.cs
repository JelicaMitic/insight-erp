public class AnalyticsOverviewDto
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public decimal TotalSales { get; set; }
    public int TotalOrders { get; set; }
    public int UniqueCustomers { get; set; }
    public int LowStockCount { get; set; }
    public decimal AverageOrderValue { get; set; }
}

public class SalesTrendPointDto
{
    public DateTime Date { get; set; }
    public decimal Sales { get; set; }
}

public class WarehouseSalesDto
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = "";
    public decimal Revenue { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}
