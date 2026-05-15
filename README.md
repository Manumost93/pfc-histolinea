# HistoLinea (PFC DAM)

Autor: Manuel Honrado Vega
Grado Superior en Desarrollo de Aplicaciones Multiplataforma
Universidad Alfonso X el Sabio

HistoLinea es una aplicacion web para gestionar eventos historicos de forma sencilla. La idea es que el proyecto se pueda ejecutar en local, ser facil de usar y quedar bien explicado en la defensa.

---

## 1. Que hace el proyecto

HistoLinea permite:
- crear eventos historicos,
- editar eventos,
- verlos en una lista ordenada,
- filtrar por epoca y fechas,
- explorar los eventos en una linea de tiempo interactiva.

Este proyecto muestra una solucion full-stack con backend en .NET y frontend en React.

---

## 2. Tecnologias usadas

### Backend
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core 8
- SQLite local
- Swagger en modo Development

### Frontend
- React 19 + TypeScript
- Vite 5
- Material UI 7
- MUI DataGrid
- Axios
- vis-timeline

---

## 3. Estructura del proyecto

- backend/
  - Histolinea.Api/ -> API REST y configuracion
  - Histolinea.Application/ -> DTOs y validaciones
  - Histolinea.Domain/ -> entidad principal
  - Histolinea.Infrastructure/ -> DbContext y migraciones
- frontend/histolinea-web/ -> aplicacion React
- docs/ -> documentacion y notas del proyecto

---

## 4. Modelo de datos principal

Entidad: HistoricalEvent
- Id (Guid)
- Title (string)
- Description (string?)
- StartDate (DateOnly)
- EndDate (DateOnly?)
- ImageUrl (string?)
- SourceUrl (string?)
- CreatedAtUtc (DateTime)

---

## 5. Requisitos minimos

Necesitas:
- .NET SDK 8.x
- Node.js 20 o superior
- npm

El proyecto funciona en Windows, macOS y Linux.

### Verificar el entorno

```bash
dotnet --version
node --version
npm --version
```

---

## 6. Como iniciar el proyecto rapidamente

### En Windows

Desde la raiz del proyecto ejecuta:

```cmd
scripts\run-all.cmd
```

Esto arranca el backend en http://localhost:5273 y el frontend en http://localhost:5173.

### Reiniciar la base de datos

```cmd
scripts\reset-db.cmd
```

### Solo backend

```cmd
scripts\run-backend.cmd
```

### Solo frontend

```cmd
scripts\run-frontend.cmd
```

### En Linux o macOS

```bash
./scripts/run-all.sh
./scripts/reset-db.sh
```

---

## 7. Inicio manual paso a paso

### Backend

```bash
cd backend

dotnet restore Histolinea.sln

dotnet ef database update -p src/Histolinea.Infrastructure -s src/Histolinea.Api

dotnet run --project src/Histolinea.Api
```

### Frontend

```bash
cd frontend/histolinea-web
npm install
npm run dev
```

---

## 8. Configuracion del frontend

El frontend puede leer la direccion del backend desde un archivo .env.

Copia:

```bash
frontend/histolinea-web/.env.example
```

a:

```bash
frontend/histolinea-web/.env
```

Y cambia el valor si usas otro puerto o servidor:

```env
VITE_API_URL=http://localhost:5273
```

Si no creas .env, el frontend usa http://localhost:5273.

---

## 9. Endpoints disponibles

- GET /api/Events -> lista de eventos ordenados por fecha de inicio
- GET /api/Events/{id} -> detalle del evento
- POST /api/Events -> crear un evento
- PUT /api/Events/{id} -> actualizar un evento
- DELETE /api/Events/{id} -> borrar un evento

---

## 10. Que hace cada parte

### Pagina de eventos

- Lista los eventos con busqueda rapida.
- Permite filtrar por epoca y fechas.
- Permite crear, editar y borrar eventos.
- Incluye un dialogo de detalle con imagen y enlace a la fuente.

### Pagina de timeline

- Muestra los eventos en una linea de tiempo interactiva.
- Permite hacer zoom con Ctrl + rueda.
- Incluye botones Fit y Hoy.
- Permite ver los detalles al hacer clic en un evento.
- Permite crear y editar eventos desde la misma vista.

### Formulario de evento

Comprueba:
- titulo obligatorio,
- fecha de inicio obligatoria,
- fecha de fin no anterior a fecha de inicio,
- URLs validas para imagen y fuente.

---

## 11. Cambios recientes y mejoras

- Anadi VITE_API_URL para que el frontend pueda cambiar la URL del backend sin tocar el codigo.
- Anadi frontend/histolinea-web/.env.example para facilitar la configuracion.
- Mejore la validacion del formulario para mostrar errores en cada campo.
- Quite archivos de plantilla innecesarios en el backend (Class1.cs).
- Corregi los archivos DTO CreateHistoricalEventDto.cs y UpdateHistoricalEventDto.cs.
- Anadi .eslintrc.cjs para configuracion basica de lint en el frontend.
- Mejore la experiencia de la timeline con un mensaje cuando no hay eventos.
- Cambie index.html para usar lang="es" y mejorar los metadatos.
- Actualice .gitignore para ignorar node_modules, dist y bases de datos locales.

---

## 12. Archivos importantes

- backend/src/Histolinea.Api/Program.cs -> configuracion de la API y seed de datos.
- backend/src/Histolinea.Application/DTOs/CreateHistoricalEventDto.cs -> validacion de creacion.
- backend/src/Histolinea.Application/DTOs/UpdateHistoricalEventDto.cs -> validacion de edicion.
- backend/src/Histolinea.Domain/Entities/HistoricalEvent.cs -> modelo principal.
- backend/src/Histolinea.Infrastructure/Persistence/HistolineaDbContext.cs -> configuracion de EF Core.
- frontend/histolinea-web/src/App.tsx -> estructura y navegacion.
- frontend/histolinea-web/src/pages/EventsPage.tsx -> lista y CRUD de eventos.
- frontend/histolinea-web/src/pages/TimelinePage.tsx -> timeline interactiva.
- frontend/histolinea-web/src/components/EventDialog.tsx -> formulario de evento.

---

## 13. Estado actual

El proyecto esta listo para funcionar en local y presentarse como trabajo de fin de grado. Esta diseñado para ser facil de ejecutar y para mantener un flujo claro de uso.
