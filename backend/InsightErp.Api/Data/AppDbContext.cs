using InsightErp.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace InsightErp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }

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
        //Product - Warehouse
        b.Entity<Product>()
        .HasOne(p => p.Warehouse)
        .WithMany(w => w.Products)
        .HasForeignKey(p => p.WarehouseId)
        .OnDelete(DeleteBehavior.Restrict);

        // Order - OrderItem (cascade delete)
        b.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // OrderItem - Product (restrict)
        b.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Invoice - Order (1-1, unique)
        b.Entity<Invoice>()
            .HasOne(i => i.Order)
            .WithOne(o => o.Invoice)
            .HasForeignKey<Invoice>(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(18,2)");
        b.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        b.Entity<OrderItem>().Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
        b.Entity<Invoice>().Property(i => i.Amount).HasColumnType("decimal(18,2)");
        b.Entity<Invoice>().Property(i => i.Tax).HasColumnType("decimal(18,2)");


        b.Entity<Invoice>()
            .HasIndex(i => i.OrderId).IsUnique();
    }
}
