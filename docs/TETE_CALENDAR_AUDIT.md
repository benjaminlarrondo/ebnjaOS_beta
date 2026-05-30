# TETE_CALENDAR_AUDIT.md

## Endpoint auditado
- Repositorio: `benjaminlarrondo/celeste_calendar`
- Archivo fuente activo detectado: `data/versions/state_20260526_202145.json`
- URL fuente: https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/main/data/versions/state_20260526_202145.json

## JSON recibido
- Estructura principal observada: `version`, `year`, `days`, `meta`
- Campo oficial de propiedad por día: `days[YYYY-MM-DD].owner`
- Valores observados para `owner`: `mine`, `hers`

## Transformación previa (problema)
- Origen visual en app: `src/modules/calendar/page.tsx` + `src/components/calendar/CalendarMonthGrid.tsx`.
- Antes se renderizaba Tete con punto rojo usando interpretación `owner === "mine"`, lo que invertía semántica visual para el caso solicitado.
- Además, el estado del mes se derivaba desde eventos sincronizados, en vez de usar directamente el estado oficial del endpoint.

## Corrección aplicada
- Fuente oficial para render mensual: `fetchOfficialCelesteCalendarState()` desde `src/services/githubCalendarSync.ts`.
- Normalización robusta en `src/lib/celesteCalendar.ts` (no depende estrictamente de `year`).
- Render de celdas en `src/components/calendar/CalendarMonthGrid.tsx`:
  - Días conmigo (`owner === "mine"`): `rgba(214,167,177,.35)`
  - Días Tete (`owner === "hers"`): `rgba(231,212,133,.35)`
  - Hoy: outline amarillo (ring/border accent).
- Eliminado completamente:
  - punto rojo
  - leyenda basada en punto
  - lógica derivada por heurística para Tete

## Campo oficial usado
- Único campo utilizado para clasificación visual: `days[date].owner` del JSON oficial de celeste_calendar.
