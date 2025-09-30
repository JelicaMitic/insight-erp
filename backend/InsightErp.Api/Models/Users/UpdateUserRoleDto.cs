using System.ComponentModel.DataAnnotations;

namespace InsightErp.Api.Models.Users;

public class UpdateUserRoleDto
{
    [Required]
    public int RoleId { get; set; }
}
