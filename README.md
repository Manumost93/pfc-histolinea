# HistoLinea

**Autor:** Manuel Honrado Vega  
**Grado Superior en Desarrollo de Aplicaciones Multiplataforma**  
**Universidad Alfonso X el Sabio**

---

HistoLinea es una aplicación web fullstack para gestionar y explorar eventos históricos. Combina un backend en .NET 8 con un frontend en React 19, ofreciendo dos vistas complementarias: una tabla de gestión y una línea de tiempo interactiva.

**Demo en Vercel:** [portfolio-kohl-seven-15tnfk4ujq.vercel.app](https://portfolio-kohl-seven-15tnfk4ujq.vercel.app/)

---

## Funcionalidades

- Crear, editar, visualizar y eliminar eventos históricos
- **Vista Lista** con tabla paginada, búsqueda rápida y columna de época con color
- **Vista Timeline** interactiva con zoom y agrupación por era histórica
- **Estadísticas por época** en el panel de cabecera
- **Modo oscuro / claro** con toggle en la barra de navegación
- Filtros por época histórica (Antigua, Medieval, Moderna, Contemporánea) y rango de fechas
- Preview de imagen y detección automática de época al crear/editar un evento
- Miniaturas de imagen en la timeline
- Validaciones en formulario (título, fechas, URLs)
- Diseño tipo pergamino/museo con tema personalizado en tonos cuero

---

## Tecnologías

### Backend
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core 8
- SQLite (desarrollo local)
- Swagger en modo Development

### Frontend
- React 19 + TypeScript
- Vite 5
- Material UI 7 (MUI)
- MUI DataGrid
- Axios
- vis-timeline

---

## Estructura del proyecto

```
pfc-histolinea/
├── backend/
│   ├── Histolinea.Api/          → API REST, controladores, configuración
│   ├── Histolinea.Application/  → DTOs y validaciones
│   ├── Histolinea.Domain/       → Entidad principal HistoricalEvent
│   └── Histolinea.Infrastructure/ → DbContext y migraciones EF Core
│
├── frontend/histolinea-web/     → Aplicación React
│   └── src/
│       ├── App.tsx              → Shell con ThemeProvider y modo oscuro
│       ├── theme.ts             → Tema MUI dinámico (claro / oscuro)
│       ├── pages/
│       │   ├── EventsPage.tsx   → Tabla DataGrid con CRUD
│       │   └── TimelinePage.tsx → Línea de tiempo vis-timeline
│       ├── components/
│       │   └── EventDialog.tsx  → Formulario crear/editar con preview de época
│       └── utils/
│           └── era.ts           → Clasificación de épocas históricas
│
├── docs/                        → Documentación y notas del proyecto
└── scripts/                     → Scripts de inicio rápido
```

---

## Modelo de datos

**Entidad: `HistoricalEvent`**

| Campo | Tipo | Descripción |
|---|---|---|
| `Id` | Guid | Identificador único |
| `Title` | string | Título del evento (obligatorio, máx. 200 chars) |
| `Description` | string? | Descripción opcional (máx. 4000 chars) |
| `StartDate` | DateOnly | Fecha de inicio (obligatoria) |
| `EndDate` | DateOnly? | Fecha de fin (opcional, >= StartDate) |
| `ImageUrl` | string? | URL de imagen (máx. 500 chars) |
| `SourceUrl` | string? | Enlace a fuente bibliográfica |
| `CreatedAtUtc` | DateTime | Fecha de creación (auto) |

---

## Clasificación de épocas

| Época | Rango | Color |
|---|---|---|
| Antigua | < 476 d.C. | Verde |
| Medieval | 476 – 1491 | Marrón |
| Moderna | 1492 – 1788 | Azul |
| Contemporánea | >= 1789 | Púrpura |

---

## Requisitos

- .NET SDK 8.x
- Node.js 20 o superior
- npm

### Verificar entorno

```bash
dotnet --version
node --version
npm --version
```

---

## Inicio rápido

### Todo en uno (abre 2 terminales separadas)

```cmd
scripts\run-all.cmd
```

Arranca:
- **Backend** en `http://localhost:5273`
- **Frontend** en `http://localhost:5173`

### Solo backend

```cmd
scripts\run-backend.cmd
```

### Solo frontend

```cmd
scripts\run-frontend.cmd
```

### Reiniciar base de datos

```cmd
scripts\reset-db.cmd
```

### En Linux / macOS

```bash
./scripts/run-all.sh
./scripts/reset-db.sh
```

---

## Inicio manual paso a paso

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

## Configuración del frontend

El frontend lee la URL del backend desde un archivo `.env`.

Copia el ejemplo y ajusta si usas otro puerto:

```bash
cp frontend/histolinea-web/.env.example frontend/histolinea-web/.env
```

```env
VITE_API_URL=http://localhost:5273
```

Sin `.env`, el frontend usa `http://localhost:5273` por defecto.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Events` | Lista de eventos ordenados por fecha |
| `GET` | `/api/Events/{id}` | Detalle de un evento |
| `POST` | `/api/Events` | Crear un evento |
| `PUT` | `/api/Events/{id}` | Actualizar un evento |
| `DELETE` | `/api/Events/{id}` | Eliminar un evento |

Swagger disponible en `http://localhost:5273/swagger` en modo Development.

---

## Funcionalidad por página

### Página de Eventos
- Lista paginada con búsqueda rápida (DataGrid MUI)
- **Columna Época** con chip de color clasificando el evento históricamente
- **Estadísticas por época** en la cabecera (contadores por era)
- Filtros por época y rango de fechas
- CRUD completo con diálogos de detalle y confirmación

### Página de Timeline
- Línea de tiempo interactiva (vis-timeline)
- Zoom con `Ctrl + rueda de ratón`
- Eventos agrupados por época con **leyenda de colores**
- Miniaturas de imagen en cada evento
- Tooltip con vista previa al hacer hover
- Crear, editar y eliminar desde la misma vista

### Formulario de Evento
- **Preview de época** en tiempo real al introducir la fecha de inicio
- Validaciones: título obligatorio, fecha de inicio obligatoria, fechas consistentes, URLs válidas
- Preview de imagen antes de guardar

---

## Mejoras incluidas en esta versión

- Modo oscuro / claro con toggle en la barra de navegación
- Tema dinámico que adapta colores de fondo, paper y texto
- Columna "Época" con chip de color en la tabla de eventos
- Estadísticas de eventos por época en la cabecera de ambas páginas
- Leyenda de épocas con chips de color en la vista Timeline
- Preview de época en el formulario al introducir la fecha de inicio
- Chip de época en el encabezado de los diálogos de detalle
- Fechas formateadas en formato `DD/MM/YYYY` en tabla y diálogos
- Botón "Ver fuente" mejorado con icono de enlace externo
- Botón "Editar" añadido al diálogo de detalle en la vista Eventos
- Animaciones suaves de entrada para los paneles (Paper)
- Scrollbar personalizado con colores del tema
- Hover de items en la timeline con efecto elevación
- Logo mejorado en la barra de navegación (icono sobre fondo cuero con gradiente)
- Footer con nombre del autor, stack tecnológico y enlace a GitHub

---

## Archivos clave

| Archivo | Descripción |
|---|---|
| `backend/src/Histolinea.Api/Program.cs` | Configuración API, CORS, seed de datos |
| `backend/src/Histolinea.Domain/Entities/HistoricalEvent.cs` | Modelo principal |
| `frontend/histolinea-web/src/App.tsx` | Shell, ThemeProvider, modo oscuro |
| `frontend/histolinea-web/src/theme.ts` | Función `createAppTheme(mode)` |
| `frontend/histolinea-web/src/pages/EventsPage.tsx` | Tabla con CRUD |
| `frontend/histolinea-web/src/pages/TimelinePage.tsx` | Timeline interactiva |
| `frontend/histolinea-web/src/components/EventDialog.tsx` | Formulario con preview de época |
| `frontend/histolinea-web/src/utils/era.ts` | Clasificación y colores de épocas |
