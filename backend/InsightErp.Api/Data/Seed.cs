using InsightErp.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
    }
}
