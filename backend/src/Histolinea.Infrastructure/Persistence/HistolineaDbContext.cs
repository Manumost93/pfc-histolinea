using Histolinea.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Histolinea.Infrastructure.Persistence;

public class HistolineaDbContext : DbContext
{
    public HistolineaDbContext(DbContextOptions<HistolineaDbContext> options) : base(options)
    {
    }

    public DbSet<HistoricalEvent> HistoricalEvents => Set<HistoricalEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HistoricalEvent>(entity =>
        {
            entity.ToTable("HistoricalEvents");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Description)
                .HasMaxLength(4000);

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            entity.Property(x => x.SourceUrl)
                .HasMaxLength(500);
        });
    }
}
