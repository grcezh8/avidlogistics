using System;

namespace AVIDLogistics.Domain.Entities
{
    public class User
    {
        public int Id { get; private set; }
        public string Username { get; private set; }
        public string Email { get; private set; }
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string Role { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public DateTime? LastLoginDate { get; private set; }
        public string PasswordHash { get; set; }


        public User(string userName, string email, string firstName, string lastName, string role)
        {
            Username = userName ?? throw new ArgumentNullException(nameof(userName));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
            LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
            Role = role ?? throw new ArgumentNullException(nameof(role));
            IsActive = true;
            CreatedDate = DateTime.UtcNow;
        }

        public void UpdateRole(string newRole)
        {
            Role = newRole ?? throw new ArgumentNullException(nameof(newRole));
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void Reactivate()
        {
            IsActive = true;
        }

        public void RecordLogin()
        {
            LastLoginDate = DateTime.UtcNow;
        }
    }
}
