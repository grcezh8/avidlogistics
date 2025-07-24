using AVIDLogistics.Application.Interfaces;
using AVIDLogistics.Application.DTOs;
using AVIDLogistics.Domain.Entities;
using AVIDLogistics.Domain.Enums;
using AVIDLogistics.Domain.Exceptions;
public class CreateUserUseCase
{
    private readonly IUserRepository _userRepository;

    public CreateUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<int> ExecuteAsync(CreateUserInput input)
    {
        if (await _userRepository.ExistsAsync(input.UserName))
            throw new InvalidOperationException("User with this username already exists");

        var user = new User(input.UserName, input.Email, input.FirstName, input.LastName, input.Role);
        await _userRepository.AddAsync(user);
        return user.Id;
    }
}
