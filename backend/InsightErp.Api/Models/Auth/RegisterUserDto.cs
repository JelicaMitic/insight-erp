namespace InsightErp.Api.Models.Auth;

public class RegisterUserDto
{
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public int RoleId { get; set; }        
}
