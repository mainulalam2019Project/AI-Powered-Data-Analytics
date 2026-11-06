using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Analytics.WebApi.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _svc;
    public ProjectController(IProjectService svc) => _svc = svc;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectRequest req, CancellationToken ct)
        => Ok(await _svc.CreateAsync(UserId, req, ct));

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> List(CancellationToken ct)
        => Ok(await _svc.ListAsync(UserId, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> Get(Guid id, CancellationToken ct)
    {
        var p = await _svc.GetAsync(UserId, id, ct);
        return p is null ? NotFound() : Ok(p);
    }
}