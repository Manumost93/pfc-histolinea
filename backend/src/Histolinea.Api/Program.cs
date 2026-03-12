using Histolinea.Domain.Entities;
using Histolinea.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); // 👈 ACTIVA LOS CONTROLLERS
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<HistolineaDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173"));
});

var app = builder.Build();

// Ensure database is created and seed sample data for first run.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HistolineaDbContext>();
    db.Database.Migrate();

    if (!db.HistoricalEvents.Any())
    {
        db.HistoricalEvents.AddRange(
            new HistoricalEvent
            {
                Title = "Construccion de la Gran Piramide de Guiza",
                Description = "Obra monumental del Antiguo Egipto atribuida al faraon Keops.",
                StartDate = new DateOnly(2580, 1, 1),
                EndDate = new DateOnly(2560, 12, 31),
                SourceUrl = "https://es.wikipedia.org/wiki/Gran_pir%C3%A1mide_de_Guiza"
            },
            new HistoricalEvent
            {
                Title = "Caida de Constantinopla",
                Description = "Conquista otomana de Constantinopla en 1453, fin del Imperio Bizantino.",
                StartDate = new DateOnly(1453, 5, 29),
                ImageUrl = "/images/Conquest_of_Constantinople,_Zonaro.jpg",
                SourceUrl = "https://es.wikipedia.org/wiki/Toma_de_Constantinopla_(1453)"
            },
            new HistoricalEvent
            {
                Title = "Rendicion de Granada",
                Description = "Capitulacion del Reino nazari de Granada ante los Reyes Catolicos.",
                StartDate = new DateOnly(1492, 1, 2),
                ImageUrl = "/images/La_Rendici%C3%B3n_de_Granada_-_Pradilla.jpg",
                SourceUrl = "https://es.wikipedia.org/wiki/Toma_de_Granada"
            },
            new HistoricalEvent
            {
                Title = "Llegada de Colon a America",
                Description = "Viaje de Cristobal Colon que marca el inicio del contacto europeo con America.",
                StartDate = new DateOnly(1492, 10, 12),
                ImageUrl = "/images/Desembarco_de_Col%C3%B3n_de_Di%C3%B3scoro_Puebla.jpg",
                SourceUrl = "https://es.wikipedia.org/wiki/Descubrimiento_de_Am%C3%A9rica"
            },
            new HistoricalEvent
            {
                Title = "Llegada del ser humano a la Luna",
                Description = "Mision Apollo 11; Neil Armstrong y Buzz Aldrin caminan sobre la Luna.",
                StartDate = new DateOnly(1969, 7, 20),
                SourceUrl = "https://es.wikipedia.org/wiki/Apolo_11"
            }
        );

        db.SaveChanges();
    }
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("Frontend");


app.MapControllers(); // 👈 MAPEA LOS CONTROLLERS

app.Run();