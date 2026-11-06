using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Analytics.Domain.Entities;
using Analytics.Infrastructure.Persistence;
using Analytics.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;
    private readonly ProjectRepository _repo;
    public ProjectService(AppDbContext db) { _db = db; _repo = new ProjectRepository(db); }

    public async Task<ProjectDto> CreateAsync(Guid userId, CreateProjectRequest req, CancellationToken ct = default)
    {
        var p = new Project { UserId = userId, Name = req.Name, Description = req.Description };
        await _repo.AddAsync(p, ct);
        await _db.SaveChangesAsync(ct);
        return new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt, 0);
    }

    public async Task<List<ProjectDto>> ListAsync(Guid userId, CancellationToken ct = default)
    {
        var projects = await _repo.GetByUserAsync(userId, ct);
        var result = new List<ProjectDto>();
        foreach (var p in projects)
        {
            var count = await _db.Datasets.CountAsync(d => d.ProjectId == p.Id, ct);
            result.Add(new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt, count));
        }
        return result;
    }

    public async Task<ProjectDto?> GetAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var p = await _repo.GetByIdAsync(id, ct);
        if (p is null || p.UserId != userId) return null;
        var count = await _db.Datasets.CountAsync(d => d.ProjectId == p.Id, ct);
        return new ProjectDto(p.Id, p.Name, p.Description, p.CreatedAt, count);
    }
}