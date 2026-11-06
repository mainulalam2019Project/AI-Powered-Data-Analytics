using Analytics.Application.Interfaces;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;

namespace Analytics.Infrastructure.Integration;

public class FastApiClient : IFastApiClient
{
    private readonly HttpClient _http;
    public FastApiClient(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _http.BaseAddress = new Uri(cfg["FastApi:BaseUrl"] ?? "http://localhost:8000");
        var key = cfg["FastApi:ServiceKey"];
        if (!string.IsNullOrEmpty(key)) _http.DefaultRequestHeaders.Add("X-Service-Key", key);
    }

    private async Task<object> PostAsync(string path, object payload, CancellationToken ct)
    {
        var res = await _http.PostAsJsonAsync(path, payload, ct);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<object>(ct) ?? new { };
    }

    public Task<object> ProfileDatasetAsync(string storagePath, string fileType, CancellationToken ct = default)
        => PostAsync("/ai/datasets/profile", new { storagePath, fileType }, ct);

    public Task<object> RunAnalysisAsync(string storagePath, string operation, object parameters, CancellationToken ct = default)
        => PostAsync("/ai/analysis/run", new { storagePath, operation, parameters }, ct);

    public Task<object> TrainModelAsync(object payload, CancellationToken ct = default)
        => PostAsync("/ai/ml/train", payload, ct);

    public Task<object> PredictAsync(object payload, CancellationToken ct = default)
        => PostAsync("/ai/ml/predict", payload, ct);

    public Task<object> GenerateInsightsAsync(object payload, CancellationToken ct = default)
        => PostAsync("/ai/insights/generate", payload, ct);
}