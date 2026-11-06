namespace Analytics.Application.DTOs;

public record TrainModelRequest(Guid DatasetId, string Name, string TaskType, string Algorithm, string? TargetColumn, List<string> FeatureColumns);
public record ModelDto(Guid Id, Guid DatasetId, string Name, string TaskType, string Algorithm, string? TargetColumn, string Status, string? Metrics, string? FeatureImportance, DateTime CreatedAt);
public record PredictRequest(Guid ModelId, List<Dictionary<string, object>> Rows);
public record PredictionDto(Guid Id, Guid ModelId, object Result, object? Explanation, DateTime CreatedAt);
public record InsightDto(string Summary, List<string> Trends, List<string> Anomalies, List<string> Recommendations);