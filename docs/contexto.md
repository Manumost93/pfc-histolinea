📌 RESUMEN COMPLETO DEL PROYECTO (para pegar en otro chat)

Proyecto: HistoLinea (PFC DAM)
Objetivo: App web para gestionar eventos históricos y visualizarlos en lista y en una timeline interactiva.
Entorno local:

Backend: http://localhost:5273

Frontend: http://localhost:5173

🧱 Stack real actual

Backend

ASP.NET Core Web API .NET 8

Entity Framework Core 8

SQLite (dev)

Arquitectura por capas (DDD simplificada): Api / Application / Domain / Infrastructure

Swagger activo en Development

CORS configurado para frontend

Frontend

React 19 + TypeScript

Vite 5

Material UI 7

MUI DataGrid

Axios

vis-timeline (timeline interactiva)

main.tsx sin StrictMode (se quitó por tema de doble montaje en dev)

✅ Estado actual funcional
Backend (funcionando)

Entidad HistoricalEvent

id: Guid

title: string

description?: string

startDate: DateOnly

endDate?: DateOnly

imageUrl?: string

sourceUrl?: string

createdAtUtc: DateTime

DbContext

Tabla: HistoricalEvents

Constraints de longitud:

Title 200

Description 4000

ImageUrl 500

SourceUrl 500

Migración inicial funcionando

Endpoints

GET /api/Events → lista ordenada por startDate

GET /api/Events/{id} → detalle

POST /api/Events → crea (⚠️ actualmente no asigna endDate en create)

PUT /api/Events/{id} → actualiza incluyendo endDate nullable

DELETE /api/Events/{id} → elimina

CORS

Permite http://localhost:5173 y http://127.0.0.1:5173

SQLite

Connection string dev: Data Source=histolinea.dev.db

Nota ejecución backend

Se ejecuta desde solución con:

dotnet run --project src/Histolinea.Api/Histolinea.Api.csproj

✅ Frontend (funcionando)
Estructura UI

App.tsx actúa como “shell” con tabs: Eventos / Timeline

Tema MUI custom estilo “historia/pergamino” (theme.ts) + fondo no blanco

Todo centrado con Container y maxWidth

Página “Eventos” (EventsPage.tsx)

DataGrid con:

Quick search

Empty state cuando no hay eventos

Toolbar custom

Acciones por evento:

Ver (Dialog con info + imagen si existe)

Editar (reusa EventDialog)

Borrar (Dialog confirmación)

Snackbar éxito/error (feedback visual)

Formulario reutilizable (EventDialog.tsx)

Modal para crear/editar evento

Validaciones:

título obligatorio

startDate obligatorio

endDate >= startDate

validación URLs http/https (imageUrl/sourceUrl)

Convierte yyyy-mm-dd a ISO con T00:00:00 para backend

Página “Timeline” (TimelinePage.tsx)

vis-timeline con:

zoom Ctrl+rueda

scroll horizontal

fit automático cuando hay items

Cada item muestra:

mini-thumbnail (si hay imageUrl)

título

Click en item → abre dialog “Ver” (con imagen)

Desde “Ver” se puede:

Editar (EventDialog)

Borrar (confirm)

Botón Crear evento desde Timeline (también usa EventDialog)

Tras crear/editar/borrar → refresca eventos y timeline

Incidencia conocida

Hubo duplicación visual puntual en timeline por Vite HMR; se resolvió reiniciando npm run dev. No era duplicado en BD.

📂 Estructura repo

backend/ (solución Histolinea.sln, código en backend/src/...)

frontend/histolinea-web/ (Vite app)

docs/ (recomendado guardar este contexto en docs/contexto.md)

⚠️ Inconsistencias / deuda técnica detectada

README raíz menciona .NET 9, SQL Server, JWT; la implementación real es .NET 8 + SQLite sin auth.

Backend aún usa DbContext directo en controller (sin services/repositorios); capas Application/Domain/Infrastructure tienen placeholders (Class1).

POST /api/Events no guarda endDate aunque el modelo lo soporte.

Falta testing (unit/integration), CI/CD y validación server-side más estricta.

Falta manejo estándar de errores (ProblemDetails) y logging estructurado.

🎯 Cómo quiero que me ayudes (reglas del mentor)

Mantén continuidad absoluta con este contexto como “fuente de verdad”.

Cambios por pasos pequeños (MVP seguro → mejoras).

Antes de proponer cambios, indicar impacto en backend/frontend/datos.

Cuando sugieras código, darlo por archivos y en orden de implementación.

Señalar inconsistencias con el contexto.

Si hay dudas, preguntar antes de romper flujo.

✅ Punto exacto en el que estamos ahora mismo

CRUD UI completo en lista y timeline.

UI con tema histórico (pergamino), centrada, con imagen en dialogs.

Timeline muestra miniaturas e integra create/edit/delete.

Backend funciona con SQLite y CORS, endpoints CRUD.

Próxima tarea recomendada

Roadmap en 3 fases (estabilidad / calidad / escalado) + prioridades.

Arreglar POST para incluir endDate.

Alinear README y documentación.

Añadir tests mínimos + CI.

Refactor backend hacia Application services / repositorio (sin sobreingeniería).

Versión corta del prompt (si no quieres pegar tanto)

“Estoy desarrollando HistoLinea (PFC DAM). Backend .NET 8 Web API + EF Core 8 + SQLite (localhost:5273), frontend React 19 + Vite 5 + TS + MUI 7 + DataGrid + vis-timeline (localhost:5173). CRUD completo de HistoricalEvent (Guid id, title, description?, startDate DateOnly, endDate DateOnly?, imageUrl?, sourceUrl?, createdAtUtc). UI: tabs Eventos/Timeline, DataGrid con búsqueda, dialogs ver/editar/borrar, snackbar, EventDialog reutilizable con validaciones y fechas ISO. Timeline: vis-timeline con zoom ctrl+rueda, thumbnails, click abre dialog, permite crear/editar/borrar desde timeline. Hubo duplicación visual por HMR, se resolvió reiniciando dev server. README desalineado (menciona .NET 9/JWT/SQL Server). Quiero roadmap 3 fases y mejoras sin sobreingeniería.”