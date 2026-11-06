using Analytics.Application.DTOs;
using Analytics.Application.Interfaces;
using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure.Persistence;
using Analytics.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure.Services;

public class DatasetService : IDatasetService
{
    private readonly AppDbContext _db;
    private readonly DatasetRepository _repo;
    private readonly IFileStorage _storage;
    private readonly IFastApiClient _fastApi;

    public DatasetService(AppDbContext db, IFileStorage storage, IFastApiClient fastApi)
    {
        _db = db; _repo = new DatasetRepository(db); _storage = storage; _fastApi = fastApi;
    }

    public async Task<DatasetDto> UploadAsync(Guid userId, Guid projectId, string? name, Stream fileStream, string fileName, long size, CancellationToken ct = default)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId, ct)
            ?? throw new UnauthorizedAccessException("Project not found.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (ext is not ".csv" and not ".xlsx" and not ".xls")
            throw new InvalidOperationException("Only CSV/Excel files are allowed.");

        var storagePath = await _storage.SaveAsync(fileStream, fileName, ct);

        var dataset = new Dataset
        {
            ProjectId = projectId,
            UserId = userId,
            Name = string.IsNullOrWhiteSpace(name) ? Path.GetFileNameWithoutExtension(fileName) : name,
            OriginalFileName = fileName,
            StoragePath = storagePath,
            FileType = ext.TrimStart('.'),
            FileSizeBytes = size,
            Status = DatasetStatus.Uploaded
        };
        await _repo.AddAsync(dataset, ct);
        await _db.SaveChangesAsync(ct);

        // profile asynchronously (best-effort)
        try
        {
            var profile = await _fastApi.ProfileDatasetAsync(storagePath, dataset.FileType, ct);
            ApplyProfile(dataset, profile);
            dataset.Status = DatasetStatus.Profiled;
        }
        catch
        {
            dataset.Status = DatasetStatus.Failed;
        }
        await _db.SaveChangesAsync(ct);

        return ToDto(dataset);
    }

    private void ApplyProfile(Dataset dataset, object profile)
    {
        // profile is dynamic JSON; extract via System.Text.Json
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(profile);
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("rowCount", out var rc)) dataset.RowCount = rc.GetInt32();
            if (root.TryGetProperty("columnCount", out var cc)) dataset.ColumnCount = cc.GetInt32();
            if (root.TryGetProperty("missingValueCount", out var mv)) dataset.MissingValueCount = mv.GetInt32();
            if (root.TryGetProperty("duplicateRowCount", out var dr)) dataset.DuplicateRowCount = dr.GetInt32();

            if (root.TryGetProperty("columns", out var cols) && cols.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var c in cols.EnumerateArray())
                {
                    var col = new DatasetColumn
                    {
                        DatasetId = dataset.Id,
                        Name = c.GetProperty("name").GetString() ?? "",
                        DataType = Enum.Parse<DataType>(c.GetProperty("dataType").GetString() ?? "Text", true),
                        IsNullable = c.GetProperty("isNullable").GetBoolean(),
                        MissingCount = c.GetProperty("missingCount").GetInt32(),
                        DistinctCount = c.TryGetProperty("distinctCount", out var dc) ? dc.GetInt32() : null,
                        SampleValues = c.TryGetProperty("sampleValues", out var sv) ? sv.ToString() : null,
                        Statistics = c.TryGetProperty("statistics", out var st) ? st.ToString() : null
                    };
                    _db.DatasetColumns.Add(col);
                }
            }
        }
        catch { /* ignore profile parse errors */ }
    }

    public async Task<DatasetProfileDto?> GetProfileAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var dataset = await _db.Datasets.Include(d => d.Columns).FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId, ct);
        if (dataset is null) return null;
        var cols = dataset.Columns.Select(c => new DatasetColumnDto(c.Id, c.Name, c.DataType.ToString(), c.IsNullable, c.MissingCount, c.DistinctCount, c.SampleValues, c.Statistics)).ToList();
        return new DatasetProfileDto(ToDto(dataset), cols, null);
    }

    public async Task<List<DatasetDto>> ListByProjectAsync(Guid userId, Guid projectId, CancellationToken ct = default)
    {
        var list = await _db.Datasets.Where(d => d.ProjectId == projectId && d.UserId == userId).AsNoTracking().ToListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    private static DatasetDto ToDto(Dataset d) => new(d.Id, d.ProjectId, d.Name, d.OriginalFileName, d.FileType, d.FileSizeBytes, d.Status.ToString(), d.RowCount, d.ColumnCount, d.MissingValueCount, d.DuplicateRowCount, d.CreatedAt);
}