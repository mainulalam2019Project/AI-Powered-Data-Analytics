using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure.Persistence;
using Analytics.Infrastructure.Repositories;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Analytics.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;
    private readonly UserRepository _users;

    public AuthService(AppDbContext db, IConfiguration cfg)
    {
        _db = db; _cfg = cfg; _users = new UserRepository(db);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct = default)
    {
        if (await _users.GetByEmailAsync(req.Email, ct) is not null)
            throw new InvalidOperationException("Email already registered.");

        var user = new User { Email = req.Email, FullName = req.FullName, PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password) };
        await _users.AddAsync(user, ct);
        await _db.SaveChangesAsync(ct);

        // assign Analyst role by default
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == RoleName.Analyst.ToString(), ct);
        if (role is null) { role = new Role { Name = RoleName.Analyst.ToString() }; _db.Roles.Add(role); await _db.SaveChangesAsync(ct); }
        _db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        await _db.SaveChangesAsync(ct);

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(req.Email, ct);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");
        if (!user.IsActive) throw new UnauthorizedAccessException("Account disabled.");
        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        // Simple refresh: validate JWT refresh token issued by us
        var principal = ValidateToken(refreshToken, validateLifetime: true);
        var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _users.GetByIdAsync(userId, ct) ?? throw new UnauthorizedAccessException("User not found.");
        return await IssueAsync(user, ct);
    }

    private async Task<AuthResponse> IssueAsync(User user, CancellationToken ct)
    {
        var roles = await _db.UserRoles.Where(ur => ur.UserId == user.Id)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name).ToListAsync(ct);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(double.Parse(_cfg["Jwt:AccessMinutes"] ?? "60"));
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _cfg["Jwt:Issuer"],
            audience: _cfg["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var access = new JwtSecurityTokenHandler().WriteToken(token);
        // refresh token = long-lived jwt
        var refreshExpires = DateTime.UtcNow.AddDays(double.Parse(_cfg["Jwt:RefreshDays"] ?? "7"));
        var refreshClaims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim("typ", "refresh") };
        var refreshToken = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            issuer: _cfg["Jwt:Issuer"], audience: _cfg["Jwt:Audience"], claims: refreshClaims,
            expires: refreshExpires, signingCredentials: creds));

        return new AuthResponse(access, refreshToken, expires, user.Id, user.Email, user.FullName, roles);
    }

    private ClaimsPrincipal ValidateToken(string token, bool validateLifetime)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = validateLifetime,
            ValidIssuer = _cfg["Jwt:Issuer"], ValidAudience = _cfg["Jwt:Audience"],
            IssuerSigningKey = key
        };
        return handler.ValidateToken(token, parameters, out _);
    }
}