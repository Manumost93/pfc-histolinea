using Histolinea.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}
