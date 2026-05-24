namespace Histolinea.Domain.Entities;

public class HistoricalEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? ImageUrl { get; set; }

    public string? SourceUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
