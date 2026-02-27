# HistoLinea

HistoLinea es una aplicación web para gestionar eventos históricos y visualizarlos tanto en una lista como en una timeline interactiva.

## Stack

**Backend**
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core 8
- SQLite (desarrollo)
- Swagger (solo en Development)

**Frontend**
- React 19 + TypeScript
- Vite 5
- Material UI (MUI) 7 + MUI DataGrid
- Axios
- vis-timeline (timeline interactiva)

## Estructura del repositorio

- `backend/` → Solución .NET (`Histolinea.sln`) y proyectos por capas:
  - `Histolinea.Api`
  - `Histolinea.Application`
  - `Histolinea.Domain`
  - `Histolinea.Infrastructure`
- `frontend/` → Aplicación React (`histolinea-web`)
- `docs/` → Documentación del proyecto (incluye contexto y notas)

## Modelo principal

**HistoricalEvent**
- `id` (Guid)
- `title` (string)
- `description` (string?)
- `startDate` (DateOnly)
- `endDate` (DateOnly?)
- `imageUrl` (string?)
- `sourceUrl` (string?)
- `createdAtUtc` (DateTime)

## API (Endpoints)

- `GET /api/Events` → lista ordenada por `startDate`
- `GET /api/Events/{id}` → detalle
- `POST /api/Events` → crear
- `PUT /api/Events/{id}` → editar
- `DELETE /api/Events/{id}` → borrar

## Ejecución local

### Backend
Desde `backend/`:

```bash
dotnet run --project src/Histolinea.Api/Histolinea.Api.csproj