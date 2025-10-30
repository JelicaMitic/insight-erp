using InsightErp.Api.Models.Users;

namespace InsightErp.Api.Models;

public class Role
{
    public int Id { get; set; }              // 1=Admin,2=Referent,3=Menadzer 
    public string Name { get; set; } = null!;
    public ICollection<User> Users { get; set; } = new List<User>();
}
