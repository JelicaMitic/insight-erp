using InsightErp.Api.Models.Users;

namespace InsightErp.Api.Services.Security;

public interface IJwtTokenService
{
    (string token, DateTime expiresUtc) Generate(User user);
}
