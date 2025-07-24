using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class DeactivateUserUseCase
{
    private readonly IUserRepository _userRepository;

    public DeactivateUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task ExecuteAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new UserNotFoundException($"User {userId} not found");

        user.Deactivate();
        await _userRepository.UpdateAsync(user);
    }
}