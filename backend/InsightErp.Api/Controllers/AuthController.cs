using InsightErp.Api.Models.Auth;
using InsightErp.Api.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsightErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    { 
        try
        {
            var result = await _auth.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }


    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Register([FromBody] RegisterUserDto dto)
    {
        var user = await _auth.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), new { id = user.Id }, new { user.Id, user.Email, user.Username, user.RoleId });
    }
}
