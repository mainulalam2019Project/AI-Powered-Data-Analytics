namespace Analytics.Application.DTOs;

public record DatasetDto(
    Guid Id,
    Guid ProjectId,
    string Name,
    string OriginalFileName,
    string FileType,
    long FileSizeBytes,
    string Status,
    int? RowCount,
    int? ColumnCount,
    int? MissingValueCount,
    int? DuplicateRowCount,
    DateTime CreatedAt);

public record DatasetColumnDto(
    Guid Id,
    string Name,
    string DataType,
    bool IsNullable,
    int MissingCount,
    int? DistinctCount,
    string? SampleValues,
    string? Statistics);

public record DatasetProfileDto(DatasetDto Dataset, List<DatasetColumnDto> Columns, object? Summary);

public record UploadDatasetRequest(Guid ProjectId, string? Name);