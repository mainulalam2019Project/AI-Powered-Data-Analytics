namespace Analytics.Application.DTOs;

public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt, Guid UserId, string Email, string FullName, List<string> Roles);
public record RefreshRequest(string RefreshToken);