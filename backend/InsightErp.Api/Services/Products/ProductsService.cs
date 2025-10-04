using InsightErp.Api.Data;
using InsightErp.Api.Models;
using InsightErp.Api.Models.Mongo;
using InsightErp.Api.Models.Products;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.Json;

namespace InsightErp.Api.Services;

public class ProductsService : IProductsService
{
    private readonly AppDbContext _db;
    private readonly MongoContext _mongo;

    public ProductsService(AppDbContext db, MongoContext mongo) { _db = db; _mongo = mongo; }

    public async Task<List<ProductListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var items = await _db.Products.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
        var ids = items.Select(x => x.Id).ToList();

        var docs = await _mongo.ProductCatalog
            .Find(Builders<ProductCatalogDocument>.Filter.In(d => d.ProductId, ids))
            .ToListAsync(ct);
        var map = docs.ToDictionary(d => d.ProductId, d => d);

        return items.Select(p => new ProductListItemDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            StockQuantity = p.StockQuantity,
            Description = map.TryGetValue(p.Id, out var d) ? d.Description : null
        }).ToList();
    }
    private object NormalizeJsonValue(object value)
    {
        if (value is JsonElement el)
        {
            switch (el.ValueKind)
            {
                case JsonValueKind.String: return el.GetString()!;
                case JsonValueKind.Number:
                    if (el.TryGetInt64(out var l)) return l;
                    if (el.TryGetDecimal(out var d)) return d;
                    return el.GetDouble();
                case JsonValueKind.True: return true;
                case JsonValueKind.False: return false;
                case JsonValueKind.Null: return null!;
                default: return el.ToString();
            }
        }
        return value;
    }

    public async Task<ProductDetailedDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p == null) return null;

        var doc = await _mongo.ProductCatalog.Find(x => x.ProductId == id).FirstOrDefaultAsync(ct);

        return new ProductDetailedDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            StockQuantity = p.StockQuantity,
            Description = doc?.Description,
            Attributes = doc?.Attributes?
           .ToDictionary(
               el => el.Name,
               el => BsonTypeMapper.MapToDotNetValue(el.Value) 
           )
        };
    }

    public async Task<ProductDetailedDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        if (await _db.Products.AnyAsync(x => x.Name == dto.Name, ct))
            throw new InvalidOperationException("Product name already exists.");

        var p = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            WarehouseId = dto.WarehouseId  
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync(ct); 

        try
        {
            var doc = new ProductCatalogDocument
            {
                ProductId = p.Id,
                Description = dto.Description,
                Attributes = dto.Attributes != null
         ? new BsonDocument(
             dto.Attributes.ToDictionary(
                 kvp => kvp.Key,
                 kvp => BsonValue.Create(NormalizeJsonValue(kvp.Value))
             )
           )
         : null
            };

            await _mongo.ProductCatalog.ReplaceOneAsync(
                x => x.ProductId == p.Id,
                doc,
                new ReplaceOptions { IsUpsert = true },
                ct
            );

        }
        catch
        {
            _db.Products.Remove(p);           
            await _db.SaveChangesAsync(ct);
            throw;
        }

        return await GetByIdAsync(p.Id, ct) ?? throw new InvalidOperationException();
    }

    public async Task<ProductDetailedDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p == null) return null;

        if (!string.Equals(p.Name, dto.Name, StringComparison.OrdinalIgnoreCase) &&
            await _db.Products.AnyAsync(x => x.Name == dto.Name, ct))
            throw new InvalidOperationException("Product name already exists.");

        p.Name = dto.Name; p.Price = dto.Price; p.StockQuantity = dto.StockQuantity; p.WarehouseId = dto.WarehouseId;
        await _db.SaveChangesAsync(ct);

        var doc = new ProductCatalogDocument { ProductId = id, Description = dto.Description,
            Attributes = dto.Attributes != null
    ? new BsonDocument(
        dto.Attributes.ToDictionary(
            kvp => kvp.Key,
            kvp => BsonValue.Create(NormalizeJsonValue(kvp.Value))
        )
      )
    : null
        };
        await _mongo.ProductCatalog.ReplaceOneAsync(x => x.ProductId == id, doc, new ReplaceOptions { IsUpsert = true }, ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<ProductDetailedDto?> DeleteAsync(int id, CancellationToken ct = default)
    {
        var existing = await GetByIdAsync(id, ct);
        if (existing == null) return null;

        var entity = await _db.Products.FirstAsync(x => x.Id == id, ct);
        _db.Products.Remove(entity);
        await _db.SaveChangesAsync(ct);

        await _mongo.ProductCatalog.DeleteOneAsync(x => x.ProductId == id, ct);
        return existing;
    }
}
