using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class SalesAggregateDocument
{
    [BsonId] public ObjectId? Id { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime Date { get; set; }           // 00:00 UTC/Local (drži dosledno)
    public decimal TotalSales { get; set; }
    public int TotalOrders { get; set; }
    public int UniqueCustomers { get; set; }
    public List<TopProductEmbedded> TopProducts { get; set; } = new();
    public List<WarehouseSalesEmbedded> SalesByWarehouse { get; set; } = new();
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime EtlRunId { get; set; } = DateTime.UtcNow;
}

public class TopProductEmbedded
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}

public class WarehouseSalesEmbedded
{
    public int WarehouseId { get; set; }
    public string Name { get; set; } = "";
    public decimal Revenue { get; set; }
}
