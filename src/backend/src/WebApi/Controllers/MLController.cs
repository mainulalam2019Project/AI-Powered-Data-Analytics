using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Analytics.WebApi.Controllers;

[ApiController]
[Route("api/ml")]
[Authorize]
public class MLController : ControllerBase
{
    private readonly IMLService _svc;
    public MLController(IMLService svc) => _svc = svc;

    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("train")]
    public async Task<ActionResult<ModelDto>> Train(TrainModelRequest req, CancellationToken ct)
        => Ok(await _svc.TrainAsync(UserId, req, ct));

    [HttpGet("models/{datasetId:guid}")]
    public async Task<ActionResult<List<ModelDto>>> List(Guid datasetId, CancellationToken ct)
        => Ok(await _svc.ListAsync(UserId, datasetId, ct));

    [HttpPost("predict")]
    public async Task<ActionResult<PredictionDto>> Predict(PredictRequest req, CancellationToken ct)
        => Ok(await _svc.PredictAsync(UserId, req, ct));
}