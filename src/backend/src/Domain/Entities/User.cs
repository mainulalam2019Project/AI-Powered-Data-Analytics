using Analytics.Domain.Common;
using Analytics.Domain.Enums;

namespace Analytics.Domain.Entities;

public class User : AuditableEntity
{
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public bool IsActive { get; set; } = true;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}

public class Role : BaseEntity
{
    public string Name { get; set; } = default!;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = default!;
}

public class Project : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public ICollection<Dataset> Datasets { get; set; } = new List<Dataset>();
}

public class Dataset : AuditableEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = default!;
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string OriginalFileName { get; set; } = default!;
    public string StoragePath { get; set; } = default!;
    public string FileType { get; set; } = default!;
    public long FileSizeBytes { get; set; }
    public DatasetStatus Status { get; set; } = DatasetStatus.Uploaded;
    public int? RowCount { get; set; }
    public int? ColumnCount { get; set; }
    public int? MissingValueCount { get; set; }
    public int? DuplicateRowCount { get; set; }

    public ICollection<DatasetColumn> Columns { get; set; } = new List<DatasetColumn>();
    public ICollection<AnalysisResult> AnalysisResults { get; set; } = new List<AnalysisResult>();
    public ICollection<MLModel> MLModels { get; set; } = new List<MLModel>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
}

public class DatasetColumn : BaseEntity
{
    public Guid DatasetId { get; set; }
    public Dataset Dataset { get; set; } = default!;
    public string Name { get; set; } = default!;
    public DataType DataType { get; set; }
    public bool IsNullable { get; set; }
    public int MissingCount { get; set; }
    public int? DistinctCount { get; set; }
    public string? SampleValues { get; set; }   // JSON
    public string? Statistics { get; set; }      // JSON
}

public class AnalysisResult : BaseEntity
{
    public Guid DatasetId { get; set; }
    public Dataset Dataset { get; set; } = default!;
    public AnalysisType Type { get; set; }
    public string Payload { get; set; } = default!; // JSON
}

public class MLModel : AuditableEntity
{
    public Guid DatasetId { get; set; }
    public Dataset Dataset { get; set; } = default!;
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public string Name { get; set; } = default!;
    public TaskType TaskType { get; set; }
    public string Algorithm { get; set; } = default!;
    public string? TargetColumn { get; set; }
    public string FeatureColumns { get; set; } = "[]"; // JSON
    public string? Metrics { get; set; } // JSON
    public string? FeatureImportance { get; set; } // JSON
    public string? ArtifactPath { get; set; }
    public ModelStatus Status { get; set; } = ModelStatus.Training;

    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}

public class Prediction : BaseEntity
{
    public Guid ModelId { get; set; }
    public MLModel Model { get; set; } = default!;
    public string InputPayload { get; set; } = default!; // JSON
    public string Result { get; set; } = default!;       // JSON
    public string? Explanation { get; set; }            // JSON
}

public class Report : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public Guid? DatasetId { get; set; }
    public Dataset? Dataset { get; set; }
    public Guid? ModelId { get; set; }
    public MLModel? Model { get; set; }
    public string Title { get; set; } = default!;
    public ReportFormat Format { get; set; }
    public string FilePath { get; set; } = default!;
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string Action { get; set; } = default!;
    public string? Entity { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}