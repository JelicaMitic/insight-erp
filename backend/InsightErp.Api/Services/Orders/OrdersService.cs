﻿using InsightErp.Api.Data;
using InsightErp.Api.Models;
using InsightErp.Api.Models.Orders;
using Microsoft.EntityFrameworkCore;
using InsightErp.Api.Models.Inventory;

namespace InsightErp.Api.Services.Orders;

public class OrdersService : IOrdersService
{
    private readonly AppDbContext _db;
    public OrdersService(AppDbContext db) => _db = db;

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, CancellationToken ct = default)
    {
        if (dto.Items == null || dto.Items.Count == 0)
            throw new InvalidOperationException("Order must have at least one item.");

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync(ct);

        if (products.Count != productIds.Count)
            throw new InvalidOperationException("One or more products do not exist.");

        
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var order = new Order
        {
            UserId = dto.UserId,
            Date = DateTime.UtcNow
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct); 

        decimal total = 0m;
        var itemsToAdd = new List<OrderItem>();

        foreach (var req in dto.Items)
        {
            var product = products.First(p => p.Id == req.ProductId);

            if (req.Quantity <= 0)
                throw new InvalidOperationException("Quantity must be > 0.");

            var wp = await _db.WarehouseProducts
                .FirstOrDefaultAsync(x => x.ProductId == req.ProductId && x.WarehouseId == dto.WarehouseId, ct);

            if (wp == null || wp.StockQuantity < req.Quantity)
                throw new InvalidOperationException($"Not enough stock for '{product.Name}' in the selected warehouse.");

            wp.StockQuantity -= req.Quantity;

            var unitPrice = product.Price;

            var item = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = req.Quantity,
                UnitPrice = unitPrice
            };
            itemsToAdd.Add(item);

            total += unitPrice * req.Quantity;
        }


        _db.OrderItems.AddRange(itemsToAdd);
        order.TotalAmount = total;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return await GetOrderByIdAsDto(order.Id, ct)
               ?? throw new InvalidOperationException("Order not found after creation.");
    }

    public async Task<List<OrderDto>> GetOrdersAsync(CancellationToken ct = default)
    {
        var orders = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Invoice)
            .AsNoTracking()
            .OrderByDescending(o => o.Date)
            .ToListAsync(ct);

        return orders.Select(MapOrderToDto).ToList();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id, CancellationToken ct = default)
        => await GetOrderByIdAsDto(id, ct);

    private async Task<OrderDto?> GetOrderByIdAsDto(int id, CancellationToken ct)
    {
        var o = await _db.Orders
            .Include(x => x.Items).ThenInclude(i => i.Product)
            .Include(x => x.Invoice)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return o == null ? null : MapOrderToDto(o);
    }

    private static OrderDto MapOrderToDto(Order o)
    {
        return new OrderDto
        {
            Id = o.Id,
            UserId = o.UserId,
            Date = o.Date,
            TotalAmount = o.TotalAmount,
            InvoiceStatus = o.Invoice?.Status,
            Items = o.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.UnitPrice * i.Quantity
            }).ToList()
        };
    }
}
