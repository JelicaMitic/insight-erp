using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InsightErp.Api.Models.Mongo;

public class ProductCatalogDocument
{
    [BsonId] public ObjectId Id { get; set; } = ObjectId.GenerateNewId();

    [BsonElement("productId")] public int ProductId { get; set; }
    [BsonElement("description")] public string? Description { get; set; }

    [BsonElement("attributes")]
    public BsonDocument? Attributes { get; set; }
}
