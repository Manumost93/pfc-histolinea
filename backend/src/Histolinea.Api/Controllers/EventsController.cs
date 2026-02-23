using Histolinea.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Histolinea.Application.DTOs;
using Histolinea.Domain.Entities;

namespace Histolinea.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly HistolineaDbContext _db;

    public EventsController(HistolineaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var events = await _db.HistoricalEvents
            .OrderBy(e => e.StartDate)
            .ToListAsync();

        return Ok(events);
    }

    [HttpGet("{id:guid}")]
public async Task<IActionResult> GetById(Guid id)
{
    var entity = await _db.HistoricalEvents.FindAsync(id);

    if (entity is null)
        return NotFound();

    return Ok(entity);
}

    [HttpPost]
public async Task<IActionResult> Create(CreateHistoricalEventDto dto)
{
    var entity = new HistoricalEvent
    {
        Title = dto.Title,
        Description = dto.Description,
        StartDate = DateOnly.FromDateTime(dto.StartDate),
        ImageUrl = dto.ImageUrl,
        SourceUrl = dto.SourceUrl
    };

    _db.HistoricalEvents.Add(entity);
    await _db.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
}

[HttpPut("{id:guid}")]
public async Task<IActionResult> Update(Guid id, UpdateHistoricalEventDto dto)
{
    var entity = await _db.HistoricalEvents.FindAsync(id);

    if (entity is null)
        return NotFound();

    entity.Title = dto.Title;
    entity.Description = dto.Description;
    entity.StartDate = DateOnly.FromDateTime(dto.StartDate);
    entity.EndDate = dto.EndDate is null ? null : DateOnly.FromDateTime(dto.EndDate.Value);
    entity.ImageUrl = dto.ImageUrl;
    entity.SourceUrl = dto.SourceUrl;

    await _db.SaveChangesAsync();

    return Ok(entity);
}

[HttpDelete("{id:guid}")]
public async Task<IActionResult> Delete(Guid id)
{
    var entity = await _db.HistoricalEvents.FindAsync(id);

    if (entity is null)
        return NotFound();

    _db.HistoricalEvents.Remove(entity);
    await _db.SaveChangesAsync();

    return NoContent();
}
}
