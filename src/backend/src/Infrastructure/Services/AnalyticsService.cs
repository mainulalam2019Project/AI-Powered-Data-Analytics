using Analytics.Application.Interfaces;
using Analytics.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _db;
    private readonly IFastApiClient _fast;
    public AnalyticsService(AppDbContext db, IFastApiClient fast) { _db = db; _fast = fast; }

    public async Task<object> GetEdaAsync(Guid userId, Guid datasetId, CancellationToken ct = default)
    {
        var d = await _db.Datasets.FirstOrDefaultAsync(x => x.Id == datasetId && x.UserId == userId, ct)
            ?? throw new UnauthorizedAccessException("Dataset not found.");
        return await _fast.RunAnalysisAsync(d.StoragePath, "eda", new { fileType = d.FileType }, ct);
    }

    public async Task<object> GetInsightsAsync(Guid userId, Guid datasetId, CancellationToken ct = default)
    {
        var d = await _db.Datasets.FirstOrDefaultAsync(x => x.Id == datasetId && x.UserId == userId, ct)
            ?? throw new UnauthorizedAccessException("Dataset not found.");
        return await _fast.GenerateInsightsAsync(new { storagePath = d.StoragePath, fileType = d.FileType }, ct);
    }
}