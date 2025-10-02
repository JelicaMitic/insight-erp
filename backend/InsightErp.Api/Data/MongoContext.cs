using MongoDB.Driver;
using InsightErp.Api.Models.Mongo;

namespace InsightErp.Api.Data;

public class MongoContext
{
    public IMongoDatabase Db { get; }
    public MongoContext(IConfiguration cfg)
    {
        var url = new MongoUrl(cfg.GetConnectionString("MongoConnection"));
        var client = new MongoClient(url);
        Db = client.GetDatabase(url.DatabaseName);
    }

    public IMongoCollection<ProductCatalogDocument> ProductCatalog =>
        Db.GetCollection<ProductCatalogDocument>("ProductCatalog");
}
