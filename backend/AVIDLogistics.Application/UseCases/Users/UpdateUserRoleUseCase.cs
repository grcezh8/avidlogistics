using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class UpdateUserRoleUseCase
{
    private readonly IUserRepository _userRepository;

    public UpdateUserRoleUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task ExecuteAsync(int userId, string newRole)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new UserNotFoundException($"User {userId} not found");

        user.UpdateRole(newRole);
        await _userRepository.UpdateAsync(user);
    }
}