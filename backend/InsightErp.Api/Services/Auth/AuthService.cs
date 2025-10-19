using InsightErp.Api.Data;
using InsightErp.Api.Models.Auth;
using InsightErp.Api.Models.Users;
using InsightErp.Api.Models;
using InsightErp.Api.Services.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InsightErp.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<User> RegisterAsync(RegisterUserDto dto); 
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(AppDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.UsernameOrEmail || u.Username == dto.UsernameOrEmail);

        if (user is null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials");


        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            throw new UnauthorizedAccessException("Invalid credentials");

        var (token, exp) = _jwt.Generate(user);
        return new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role.Name,
            ExpiresAtUtc = exp
        };
    }

    public async Task<User> RegisterAsync(RegisterUserDto dto)
    {
        if (!await _db.Roles.AnyAsync(r => r.Id == dto.RoleId))
            throw new ArgumentException("Role does not exist");

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email || u.Username == dto.Username))
            throw new InvalidOperationException("User with same email/username already exists");

        var user = new User
        {
            Email = dto.Email.Trim(),
            Username = dto.Username.Trim(),
            RoleId = dto.RoleId
        };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }
}
