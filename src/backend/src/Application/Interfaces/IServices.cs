using Analytics.Application.DTOs;

namespace Analytics.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
}

public interface IProjectService
{
    Task<ProjectDto> CreateAsync(Guid userId, CreateProjectRequest req, CancellationToken ct = default);
    Task<List<ProjectDto>> ListAsync(Guid userId, CancellationToken ct = default);
    Task<ProjectDto?> GetAsync(Guid userId, Guid id, CancellationToken ct = default);
}

public interface IDatasetService
{
    Task<DatasetDto> UploadAsync(Guid userId, Guid projectId, string? name, Stream fileStream, string fileName, long size, CancellationToken ct = default);
    Task<DatasetProfileDto?> GetProfileAsync(Guid userId, Guid id, CancellationToken ct = default);
    Task<List<DatasetDto>> ListByProjectAsync(Guid userId, Guid projectId, CancellationToken ct = default);
}

public interface IMLService
{
    Task<ModelDto> TrainAsync(Guid userId, TrainModelRequest req, CancellationToken ct = default);
    Task<List<ModelDto>> ListAsync(Guid userId, Guid datasetId, CancellationToken ct = default);
    Task<PredictionDto> PredictAsync(Guid userId, PredictRequest req, CancellationToken ct = default);
}

public interface IAnalyticsService
{
    Task<object> GetEdaAsync(Guid userId, Guid datasetId, CancellationToken ct = default);
    Task<object> GetInsightsAsync(Guid userId, Guid datasetId, CancellationToken ct = default);
}

public interface IFastApiClient
{
    Task<object> ProfileDatasetAsync(string storagePath, string fileType, CancellationToken ct = default);
    Task<object> RunAnalysisAsync(string storagePath, string operation, object parameters, CancellationToken ct = default);
    Task<object> TrainModelAsync(object payload, CancellationToken ct = default);
    Task<object> PredictAsync(object payload, CancellationToken ct = default);
    Task<object> GenerateInsightsAsync(object payload, CancellationToken ct = default);
}

public interface IFileStorage
{
    Task<string> SaveAsync(Stream stream, string fileName, CancellationToken ct = default);
    Task<Stream> OpenReadAsync(string storagePath, CancellationToken ct = default);
    Task DeleteAsync(string storagePath, CancellationToken ct = default);
}