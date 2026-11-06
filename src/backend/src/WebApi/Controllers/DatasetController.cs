using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Analytics.WebApi.Controllers;

[ApiController]
[Route("api/datasets")]
[Authorize]
public class DatasetController : ControllerBase
{
    private readonly IDatasetService _svc;
    public DatasetController(IDatasetService svc) => _svc = svc;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpPost]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult<DatasetDto>> Upload([FromForm] Guid projectId, [FromForm] string? name, IFormFile file, CancellationToken ct)
    {
        await using var stream = file.OpenReadStream();
        var dto = await _svc.UploadAsync(UserId, projectId, name, stream, file.FileName, file.Length, ct);
        return Ok(dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DatasetProfileDto>> Get(Guid id, CancellationToken ct)
    {
        var p = await _svc.GetProfileAsync(UserId, id, ct);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult<List<DatasetDto>>> ListByProject(Guid projectId, CancellationToken ct)
        => Ok(await _svc.ListByProjectAsync(UserId, projectId, ct));
}