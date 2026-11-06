namespace Analytics.Application.DTOs;

public record CreateProjectRequest(string Name, string? Description);
public record ProjectDto(Guid Id, string Name, string? Description, DateTime CreatedAt, int DatasetCount);