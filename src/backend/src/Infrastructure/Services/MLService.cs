using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Analytics.Infrastructure.Services;

public class MLService : IMLService
{
    private readonly AppDbContext _db;
    private readonly IFastApiClient _fastApi;

    public MLService(AppDbContext db, IFastApiClient fastApi) { _db = db; _fastApi = fastApi; }

    public async Task<ModelDto> TrainAsync(Guid userId, TrainModelRequest req, CancellationToken ct = default)
    {
        var dataset = await _db.Datasets.FirstOrDefaultAsync(d => d.Id == req.DatasetId && d.UserId == userId, ct)
            ?? throw new UnauthorizedAccessException("Dataset not found.");

        var model = new MLModel
        {
            DatasetId = dataset.Id,
            UserId = userId,
            Name = req.Name,
            TaskType = Enum.Parse<TaskType>(req.TaskType, true),
            Algorithm = req.Algorithm,
            TargetColumn = req.TargetColumn,
            FeatureColumns = JsonSerializer.Serialize(req.FeatureColumns),
            Status = ModelStatus.Training
        };
        _db.MLModels.Add(model);
        await _db.SaveChangesAsync(ct);

        try
        {
            var payload = new
            {
                storagePath = dataset.StoragePath,
                fileType = dataset.FileType,
                taskType = req.TaskType,
                algorithm = req.Algorithm,
                targetColumn = req.TargetColumn,
                featureColumns = req.FeatureColumns
            };
            var result = await _fastApi.TrainModelAsync(payload, ct);
            var json = JsonSerializer.Serialize(result);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("metrics", out var m)) model.Metrics = m.ToString();
            if (root.TryGetProperty("featureImportance", out var fi)) model.FeatureImportance = fi.ToString();
            if (root.TryGetProperty("artifactPath", out var ap)) model.ArtifactPath = ap.GetString();
            model.Status = ModelStatus.Ready;
        }
        catch (Exception ex)
        {
            model.Status = ModelStatus.Failed;
            model.Metrics = JsonSerializer.Serialize(new { error = ex.Message });
        }
        await _db.SaveChangesAsync(ct);

        return ToDto(model);
    }

    public async Task<List<ModelDto>> ListAsync(Guid userId, Guid datasetId, CancellationToken ct = default)
    {
        var list = await _db.MLModels.Where(m => m.DatasetId == datasetId && m.UserId == userId).AsNoTracking().ToListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<PredictionDto> PredictAsync(Guid userId, PredictRequest req, CancellationToken ct = default)
    {
        var model = await _db.MLModels.FirstOrDefaultAsync(m => m.Id == req.ModelId && m.UserId == userId, ct)
            ?? throw new UnauthorizedAccessException("Model not found.");
        if (model.Status != ModelStatus.Ready) throw new InvalidOperationException("Model not ready.");

        var dataset = await _db.Datasets.FirstAsync(d => d.Id == model.DatasetId, ct);
        var payload = new { storagePath = dataset.StoragePath, fileType = dataset.FileType, artifactPath = model.ArtifactPath, rows = req.Rows };
        var result = await _fastApi.PredictAsync(payload, ct);
        var json = JsonSerializer.Serialize(result);

        string? explanation = null;
        using (var doc = JsonDocument.Parse(json))
        {
            if (doc.RootElement.TryGetProperty("explanation", out var e)) explanation = e.ToString();
        }

        var pred = new Prediction { ModelId = model.Id, InputPayload = JsonSerializer.Serialize(req.Rows), Result = json, Explanation = explanation };
        _db.Predictions.Add(pred);
        await _db.SaveChangesAsync(ct);

        return new PredictionDto(pred.Id, model.Id, JsonSerializer.Deserialize<object>(pred.Result)!, explanation is null ? null : JsonSerializer.Deserialize<object>(explanation), pred.CreatedAt);
    }

    private static ModelDto ToDto(MLModel m) => new(m.Id, m.DatasetId, m.Name, m.TaskType.ToString(), m.Algorithm, m.TargetColumn, m.Status.ToString(), m.Metrics, m.FeatureImportance, m.CreatedAt);
}