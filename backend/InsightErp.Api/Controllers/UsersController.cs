using InsightErp.Api.Data;
using InsightErp.Api.Models;
using InsightErp.Api.Models.Auth;
using InsightErp.Api.Models.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] 
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _hasher = new();

    public UsersController(AppDbContext db) => _db = db;

    // GET /api/users 
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _db.Users.Include(u => u.Role).ToListAsync();
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            RoleId = u.RoleId,
            RoleName = u.Role.Name
        }).ToList();
    }

    // POST /api/users  
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] RegisterUserDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Email already exists" });

        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            RoleId = dto.RoleId
        };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        
        var role = await _db.Roles.FindAsync(user.RoleId);

        var dtoOut = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = role?.Name ?? string.Empty
        };

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, dtoOut);
    }

    // PUT /api/users/{id}  
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateRole(int id, [FromBody] UpdateUserRoleDto dto)
    {
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        user.RoleId = dto.RoleId;
        await _db.SaveChangesAsync();

      
        var role = await _db.Roles.FindAsync(user.RoleId);

        var dtoOut = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = role?.Name ?? string.Empty
        };

        return Ok(dtoOut); 
    }

    // DELETE /api/users/{id}   
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        
        var dtoOut = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name ?? string.Empty
        };

        return Ok(dtoOut); 
    }
}


