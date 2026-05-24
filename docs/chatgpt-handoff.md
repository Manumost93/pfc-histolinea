# HistoLinea — Handoff completo para continuar en ChatGPT

## 1) Contexto y objetivo
HistoLinea es una app web para gestionar eventos históricos y visualizarlos en:
- vista lista (CRUD con DataGrid)
- vista timeline interactiva (vis-timeline)

Objetivo funcional ya logrado:
- CRUD básico operativo (crear, editar, ver, borrar).

Problema abierto principal:
- mejorar el acabado visual/profesional de la timeline, especialmente consistencia de miniaturas/imágenes.

---

## 2) Stack real (actualizado)
### Backend
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core 8
- SQLite (entorno desarrollo)
- Swagger habilitado en Development

### Frontend
- React 19 + TypeScript
- Vite 5
- Material UI 7 + MUI DataGrid
- Axios
- vis-data + vis-timeline

---

## 3) Estructura del repositorio
- `backend/` solución .NET por capas
  - `Histolinea.Api`
  - `Histolinea.Application`
  - `Histolinea.Domain`
  - `Histolinea.Infrastructure`
- `frontend/histolinea-web/` app React
- `docs/` documentación

Archivos guía:
- `README.md`
- `frontend/README.md`

---

## 4) Backend: arquitectura y contratos
### 4.1 Composición de capas
- **Api**: endpoints REST y bootstrap
- **Application**: DTOs
- **Domain**: entidad principal
- **Infrastructure**: EF Core DbContext + migraciones

### 4.2 Entidad principal
`HistoricalEvent` (Domain):
- `Id: Guid`
- `Title: string`
- `Description: string?`
- `StartDate: DateOnly`
- `EndDate: DateOnly?`
- `ImageUrl: string?`
- `SourceUrl: string?`
- `CreatedAtUtc: DateTime`

### 4.3 DTOs
- `CreateHistoricalEventDto`
  - title, description, startDate, endDate?, imageUrl?, sourceUrl?
- `UpdateHistoricalEventDto`
  - title, description, startDate, endDate?, imageUrl?, sourceUrl?

### 4.4 Endpoints disponibles
- `GET /api/Events`
- `GET /api/Events/{id}`
- `POST /api/Events`
- `PUT /api/Events/{id}`
- `DELETE /api/Events/{id}`

### 4.5 Comportamiento clave
- `GetAll` ordena por `StartDate`.
- `Create` convierte `DateTime` -> `DateOnly` y ya contempla `EndDate` nullable.
- `Update` actualiza todos los campos relevantes.

### 4.6 Configuración
- CORS permitido para frontend dev:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- SQLite dev:
  - connection string en `appsettings.Development.json`: `Data Source=histolinea.dev.db`
- URL backend dev (launch settings): `http://localhost:5273`

---

## 5) Frontend: estado funcional
### 5.1 Entrada y tema
- `main.tsx` usa `ThemeProvider + CssBaseline + App`.
- `theme.ts` define estilo “papel/museo” (fondo, paleta, bordes, botones).

### 5.2 Shell y navegación
- `App.tsx` usa AppBar + Tabs:
  - `EVENTOS`
  - `TIMELINE`
- Contenedor centrado global (`maxWidth` controlado).

### 5.3 Cliente HTTP y tipos
- Axios baseURL: `http://localhost:5273`
- Tipo frontend `HistoricalEvent` alineado con backend.

### 5.4 Página de eventos (`EventsPage.tsx`)
- DataGrid con búsqueda rápida.
- Crear/Editar (dialog reutilizable).
- Ver detalle (incluye imagen y metadatos).
- Borrar con confirmación.
- Snackbar de éxito/error.

### 5.5 Dialog de evento (`EventDialog.tsx`)
- Modo create/edit.
- Validaciones:
  - título obligatorio
  - fecha inicio obligatoria
  - fin no anterior a inicio
  - URLs válidas con regex HTTP/HTTPS
- Fechas convertidas a ISO `T00:00:00`.

### 5.6 Timeline (`TimelinePage.tsx`)
- vis-timeline con:
  - `horizontalScroll: true`
  - `zoomKey: ctrlKey`
  - `stack: true`
- Selección de item abre diálogo de detalle.
- Desde timeline también se crea/edita/borra.
- `items` se reconstruyen con `useMemo` desde eventos API.

---

## 6) Problema pendiente (importante)
Tema no resuelto al 100%:
- miniaturas/imágenes en items de timeline con acabado inconsistente (percepción de desproporción y/o diseño no profesional según feedback).
- Se han probado varios enfoques y algunos se revirtieron por preferencia visual/resultado.

Conclusión operativa:
- El sistema funciona, el pendiente actual es de pulido visual UX en timeline.

---

## 7) Historial reciente relevante
- Se hicieron varios intentos de normalizar miniaturas en timeline (clases CSS e inline).
- Se aplicaron y revirtieron ajustes según feedback para volver a estado funcional aceptable.
- Se consolidó `ThemeProvider` en `main.tsx` y se limpió CSS legacy de Vite en `App.css` (neutral).
- README y `.gitignore` fueron ampliados/mejorados para continuidad y clonación limpia.

---

## 8) Estado de calidad y tooling
- No hay tests automáticos detectados (ni frontend ni backend).
- No hay CI/CD configurado actualmente.
- Build/run manual en local.

---

## 9) Riesgos/observaciones técnicas actuales
- Render HTML en `content` de vis-timeline + estilos puede ser sensible a diferencias de CSS/DOM y producir variaciones visuales.
- El mayor riesgo de tocar ahora es romper el look and feel ya aceptado en otras pantallas.
- Conviene cambios mínimos, incrementales y reversibles para timeline.

---

## 10) Cómo ejecutar local
### Backend
```bash
cd backend
dotnet restore
dotnet run --project src/Histolinea.Api/Histolinea.Api.csproj
```

### Frontend
```bash
cd frontend/histolinea-web
npm install
npm run dev
```

---

## 11) Prompt listo para pegar en un nuevo chat
Copia y pega tal cual:

---
Quiero continuar mi proyecto HistoLinea exactamente desde este punto, sin perder contexto.

Contexto actual:
- Proyecto full-stack con backend .NET 8 (Web API + EF Core + SQLite) y frontend React 19 + TS + Vite + MUI + vis-timeline.
- CRUD de eventos ya funciona (lista + timeline).
- Estado pendiente: mejora visual/profesional de la timeline, especialmente miniaturas/imágenes de los items.

Arquitectura:
- backend/Histolinea.sln con capas Api, Application, Domain, Infrastructure.
- Entidad principal HistoricalEvent: id, title, description, startDate, endDate?, imageUrl?, sourceUrl?, createdAtUtc.
- Endpoints: GET/POST/PUT/DELETE en /api/Events.

Configuración:
- Backend en http://localhost:5273
- Frontend en http://localhost:5173
- CORS configurado para esos orígenes
- SQLite dev: Data Source=histolinea.dev.db

Frontend clave:
- App con tabs EVENTOS/TIMELINE.
- EventsPage con DataGrid + búsqueda + create/edit/view/delete.
- EventDialog con validaciones y fechas ISO.
- TimelinePage con vis-timeline, zoom Ctrl+rueda, click para detalle.

Necesito que me ayudes con este criterio:
1) No rediseñar todo.
2) Cambios pequeños y reversibles.
3) Priorizar que las miniaturas de la timeline se vean proporcionadas, consistentes y profesionales.
4) Antes de tocar código, dame plan corto y riesgos.
5) Luego dame cambios por archivo y justificación.

Además, si propones una opción visual, dame 2 alternativas (conservadora y premium) para elegir.
---

## 12) Notas para continuidad sin fricción
- Si se toca timeline, mantener intactas las rutas API y el flujo CRUD.
- Evitar cambios globales de layout sin necesidad.
- Hacer commits pequeños por cada experimento visual.
- Validar siempre que no se rompan `EventsPage` ni diálogos.
