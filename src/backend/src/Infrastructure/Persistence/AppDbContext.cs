using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Dataset> Datasets => Set<Dataset>();
    public DbSet<DatasetColumn> DatasetColumns => Set<DatasetColumn>();
    public DbSet<AnalysisResult> AnalysisResults => Set<AnalysisResult>();
    public DbSet<MLModel> MLModels => Set<MLModel>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>().HasIndex(u => u.Email).IsUnique();
        b.Entity<User>().Property(u => u.Email).HasMaxLength(256);
        b.Entity<User>().Property(u => u.FullName).HasMaxLength(200);

        b.Entity<Role>().HasIndex(r => r.Name).IsUnique();
        b.Entity<Role>().Property(r => r.Name).HasMaxLength(50);

        b.Entity<UserRole>().HasKey(ur => new { ur.UserId, ur.RoleId });
        b.Entity<UserRole>().HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        b.Entity<UserRole>().HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);

        b.Entity<Project>().HasOne(p => p.User).WithMany(u => u.Projects).HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Dataset>().HasOne(d => d.Project).WithMany(p => p.Datasets).HasForeignKey(d => d.ProjectId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Dataset>().HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.NoAction);
        b.Entity<Dataset>().HasIndex(d => d.ProjectId);
        b.Entity<Dataset>().HasIndex(d => d.UserId);

        b.Entity<DatasetColumn>().HasOne(c => c.Dataset).WithMany(d => d.Columns).HasForeignKey(c => c.DatasetId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<AnalysisResult>().HasOne(a => a.Dataset).WithMany(d => d.AnalysisResults).HasForeignKey(a => a.DatasetId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<MLModel>().HasOne(m => m.Dataset).WithMany(d => d.MLModels).HasForeignKey(m => m.DatasetId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<MLModel>().HasOne(m => m.User).WithMany().HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.NoAction);

        b.Entity<Prediction>().HasOne(p => p.Model).WithMany(m => m.Predictions).HasForeignKey(p => p.ModelId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Report>().HasOne(r => r.User).WithMany(u => u.Reports).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Report>().HasOne(r => r.Dataset).WithMany(d => d.Reports).HasForeignKey(r => r.DatasetId).OnDelete(DeleteBehavior.SetNull);
        b.Entity<Report>().HasOne(r => r.Model).WithMany().HasForeignKey(r => r.ModelId).OnDelete(DeleteBehavior.SetNull);

        b.Entity<AuditLog>().HasOne(a => a.User).WithMany(u => u.AuditLogs).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}