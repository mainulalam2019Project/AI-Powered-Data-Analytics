using Analytics.Application.Interfaces;
using Analytics.Domain.Common;
using Analytics.Domain.Entities;
using Analytics.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure.Repositories;

public class GenericRepository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext Db;
    protected readonly DbSet<T> Set;
    public GenericRepository(AppDbContext db) { Db = db; Set = db.Set<T>(); }

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await Set.FindAsync(new object[] { id }, ct);

    public virtual async Task<List<T>> ListAsync(CancellationToken ct = default)
        => await Set.AsNoTracking().ToListAsync(ct);

    public virtual async Task AddAsync(T entity, CancellationToken ct = default)
        => await Set.AddAsync(entity, ct);

    public virtual void Update(T entity) => Set.Update(entity);
    public virtual void Remove(T entity) => Set.Remove(entity);
}

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext db) : base(db) { }
    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await Db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == email, ct);
}

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(AppDbContext db) : base(db) { }
    public async Task<List<Project>> GetByUserAsync(Guid userId, CancellationToken ct = default)
        => await Db.Projects.Where(p => p.UserId == userId).AsNoTracking().ToListAsync(ct);
}

public class DatasetRepository : GenericRepository<Dataset>, IDatasetRepository
{
    public DatasetRepository(AppDbContext db) : base(db) { }
    public async Task<List<Dataset>> GetByProjectAsync(Guid projectId, CancellationToken ct = default)
        => await Db.Datasets.Include(d => d.Columns).Where(d => d.ProjectId == projectId).AsNoTracking().ToListAsync(ct);
    public async Task<List<Dataset>> GetByUserAsync(Guid userId, CancellationToken ct = default)
        => await Db.Datasets.Where(d => d.UserId == userId).AsNoTracking().ToListAsync(ct);
}

public class MLModelRepository : GenericRepository<MLModel>, IMLModelRepository
{
    public MLModelRepository(AppDbContext db) : base(db) { }
    public async Task<List<MLModel>> GetByDatasetAsync(Guid datasetId, CancellationToken ct = default)
        => await Db.MLModels.Where(m => m.DatasetId == datasetId).AsNoTracking().ToListAsync(ct);
}