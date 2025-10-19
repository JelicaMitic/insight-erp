using InsightErp.Api.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using InsightErp.Api.Models.Inventory;

namespace InsightErp.Api.Data;

public static class Seed
{
    public static async Task EnsureAdminAsync(AppDbContext db)
    {
        
        if (!await db.Users.AnyAsync())
        {
            var admin = new User
            {
                Email = "admin@insighterp.test",
                Username = "admin",
                RoleId = 1 
            };
            var hasher = new PasswordHasher<User>();
            admin.PasswordHash = hasher.HashPassword(admin, "Admin#12345"); 
            db.Users.Add(admin);
            await db.SaveChangesAsync();
        }

        if (!db.Warehouses.Any())
        {
            var wh1 = new Warehouse { Name = "Glavno skladište", Location = "Beograd" };
            var wh2 = new Warehouse { Name = "Skladište Novi Sad", Location = "Novi Sad" };

            db.Warehouses.AddRange(wh1, wh2);
            await db.SaveChangesAsync();
        }


    }
}
