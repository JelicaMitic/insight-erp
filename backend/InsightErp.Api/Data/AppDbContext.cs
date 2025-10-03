using InsightErp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Warehouse> Warehouses { get; set; }
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
    }
}
