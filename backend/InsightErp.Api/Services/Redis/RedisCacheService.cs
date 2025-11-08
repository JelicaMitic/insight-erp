using StackExchange.Redis;
using System.Text.Json;

public class RedisCacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;

    public RedisCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _db = redis.GetDatabase();
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _db.StringGetAsync(key);
        return value.IsNullOrEmpty ? default : JsonSerializer.Deserialize<T>(value!);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, json, expiry);
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
    {
        var cached = await GetAsync<T>(key);
        if (cached != null) return cached;
        var data = await factory();
        await SetAsync(key, data, expiry);
        return data;
    }

    public async Task RemoveByPrefixAsync(string prefix)
    {
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        foreach (var key in server.Keys(pattern: $"{prefix}*"))
            await _db.KeyDeleteAsync(key);
    }
}
