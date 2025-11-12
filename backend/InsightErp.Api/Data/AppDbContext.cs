using InsightErp.Api.Models;
using InsightErp.Api.Models.Auth;
using InsightErp.Api.Models.Products;
using InsightErp.Api.Models.Users;
using Microsoft.EntityFrameworkCore;
using InsightErp.Api.Models.Inventory;
using System.Reflection.Emit;
using InsightErp.Api.Models.Orders;

namespace InsightErp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<WarehouseProduct> WarehouseProducts { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<ProductCategory> ProductCategories { get; set; }


    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Role>()
         .HasIndex(r => r.Name)
         .IsUnique();

        b.Entity<User>()
         .HasIndex(u => u.Email)
         .IsUnique();

        b.Entity<User>()
         .HasIndex(u => u.Username)
         .IsUnique();

        b.Entity<ProductCategory>(e =>
        {
            e.ToTable("ProductCategories");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
        });

        b.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
        });

        b.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Referent" },
            new Role { Id = 3, Name = "Menadzer" }
        );
        b.Entity<WarehouseProduct>()
          .HasKey(wp => new { wp.WarehouseId, wp.ProductId });

        b.Entity<WarehouseProduct>()
            .HasOne(wp => wp.Warehouse)
            .WithMany(w => w.WarehouseProducts)
            .HasForeignKey(wp => wp.WarehouseId);

        b.Entity<WarehouseProduct>()
            .HasOne(wp => wp.Product)
            .WithMany(p => p.WarehouseProducts)
            .HasForeignKey(wp => wp.ProductId);

        b.Entity<WarehouseProduct>()
            .Property(wp => wp.StockQuantity)
            .HasDefaultValue(0);


        b.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Invoice>()
            .HasOne(i => i.Order)
            .WithOne(o => o.Invoice)
            .HasForeignKey<Invoice>(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);


        b.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(18,2)");
        b.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        b.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
        b.Entity<Invoice>().Property(i => i.Amount).HasColumnType("decimal(18,2)");
        b.Entity<Invoice>().Property(i => i.Tax).HasColumnType("decimal(18,2)");

        b.Entity<Order>()
        .HasOne(o => o.Warehouse)
        .WithMany()                      
        .HasForeignKey(o => o.WarehouseId)
        .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Order>()
            .HasIndex(o => new { o.WarehouseId, o.Date }); 


        b.Entity<Invoice>()
            .HasIndex(i => i.OrderId).IsUnique();
    }
}
