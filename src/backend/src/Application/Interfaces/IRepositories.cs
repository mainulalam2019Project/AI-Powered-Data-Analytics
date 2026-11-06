using Analytics.Domain.Entities;

namespace Analytics.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<T>> ListAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
}

public interface IProjectRepository : IRepository<Project>
{
    Task<List<Project>> GetByUserAsync(Guid userId, CancellationToken ct = default);
}

public interface IDatasetRepository : IRepository<Dataset>
{
    Task<List<Dataset>> GetByProjectAsync(Guid projectId, CancellationToken ct = default);
    Task<List<Dataset>> GetByUserAsync(Guid userId, CancellationToken ct = default);
}

public interface IMLModelRepository : IRepository<MLModel>
{
    Task<List<MLModel>> GetByDatasetAsync(Guid datasetId, CancellationToken ct = default);
}