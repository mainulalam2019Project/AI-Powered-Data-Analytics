using Analytics.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Analytics.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;
    public LocalFileStorage(IConfiguration cfg)
    {
        _root = cfg["Storage:RootPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(_root);
    }

    public async Task<string> SaveAsync(Stream stream, string fileName, CancellationToken ct = default)
    {
        var safe = Path.GetFileName(fileName);
        var dir = Path.Combine(_root, DateTime.UtcNow.ToString("yyyy/MM/dd"));
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, $"{Guid.NewGuid()}_{safe}");
        await using var fs = File.Create(path);
        await stream.CopyToAsync(fs, ct);
        return path;
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken ct = default)
        => Task.FromResult<Stream>(File.OpenRead(storagePath));

    public Task DeleteAsync(string storagePath, CancellationToken ct = default)
    {
        if (File.Exists(storagePath)) File.Delete(storagePath);
        return Task.CompletedTask;
    }
}