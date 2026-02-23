namespace Histolinea.Application.DTOs;

public class CreateHistoricalEventDto
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    public string? ImageUrl { get; set; }

    public string? SourceUrl { get; set; }
}