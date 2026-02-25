public sealed class CreateHistoricalEventDto
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? ImageUrl { get; set; }
    public string? SourceUrl { get; set; }
}