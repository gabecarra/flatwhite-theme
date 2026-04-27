// Flatwhite theme preview — C#

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Flatwhite.Demo;

public record struct Point(double X, double Y)
{
    public double DistanceTo(Point other) =>
        Math.Sqrt(Math.Pow(other.X - this.X, 2) + Math.Pow(other.Y - this.Y, 2));

    public override string ToString() => $"({this.X:F2}, {this.Y:F2})";
}

public sealed class SpatialIndex<T>
{
    private readonly List<(Point Location, T Value)> _items = new();
    private readonly ReaderWriterLockSlim _lock = new();

    public void Add(Point location, T value)
    {
        _lock.EnterWriteLock();
        try { _items.Add((location, value)); }
        finally { _lock.ExitWriteLock(); }
    }

    public IReadOnlyList<(Point Location, T Value)> Query(Point center, double radius)
    {
        _lock.EnterReadLock();
        try
        {
            return _items
                .Where(item => item.Location.DistanceTo(center) <= radius)
                .OrderBy(item => item.Location.DistanceTo(center))
                .ToList();
        }
        finally { _lock.ExitReadLock(); }
    }

    public int Count
    {
        get { _lock.EnterReadLock(); try { return _items.Count; } finally { _lock.ExitReadLock(); } }
    }
}

public static class AsyncBatch
{
    public static async Task<IReadOnlyList<TResult>> RunAsync<TSource, TResult>(
        IEnumerable<TSource> items,
        Func<TSource, CancellationToken, Task<TResult>> selector,
        int concurrency = 4,
        CancellationToken cancellationToken = default)
    {
        using var semaphore = new SemaphoreSlim(concurrency);
        var tasks = items.Select(async item =>
        {
            await semaphore.WaitAsync(cancellationToken);
            try { return await selector(item, cancellationToken); }
            finally { semaphore.Release(); }
        });
        return await Task.WhenAll(tasks);
    }
}

class Demo
{
    static async Task Main()
    {
        var index = new SpatialIndex<string>();
        var rng = new Random(42);

        for (int i = 0; i < 100; i++)
        {
            var pt = new Point(rng.NextDouble() * 100, rng.NextDouble() * 100);
            index.Add(pt, $"item-{i}");
        }

        var origin = new Point(50.0, 50.0);
        var nearby = index.Query(origin, radius: 10.0);
        Console.WriteLine($"Found {nearby.Count} items within radius 10 of {origin}:");

        foreach (var (loc, val) in nearby.Take(5))
            Console.WriteLine($"  {val} at {loc}  (d={loc.DistanceTo(origin):F3})");

        var names = Enumerable.Range(1, 20).Select(i => $"task-{i}");
        var results = await AsyncBatch.RunAsync(
            names,
            async (name, ct) =>
            {
                await Task.Delay(10, ct);
                return name.ToUpperInvariant();
            },
            concurrency: 5);

        Console.WriteLine($"\nBatch results: {string.Join(", ", results.Take(5))} ...");
    }
}
