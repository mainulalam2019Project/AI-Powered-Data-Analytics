using Analytics.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Analytics.WebApi.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _svc;
    public AnalyticsController(IAnalyticsService svc) => _svc = svc;
    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("{datasetId:guid}/eda")]
    public async Task<ActionResult<object>> Eda(Guid datasetId, CancellationToken ct)
        => Ok(await _svc.GetEdaAsync(UserId, datasetId, ct));

    [HttpGet("{datasetId:guid}/insights")]
    public async Task<ActionResult<object>> Insights(Guid datasetId, CancellationToken ct)
        => Ok(await _svc.GetInsightsAsync(UserId, datasetId, ct));
}