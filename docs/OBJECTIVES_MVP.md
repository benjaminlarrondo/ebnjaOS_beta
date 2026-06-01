# OBJECTIVES_MVP.md

## Sprint
`2.1A — Objetivos MVP`

## Objetivo
Implementar el primer módulo funcional de Objetivos reutilizando infraestructura interna de Tracking.

## Decisión de arquitectura
- Interno se mantiene:
  - ruta: `/tracking`
  - página: `TrackingPage`
  - store: `Tracking` en `localStorage`
- Visualmente se muestra:
  - `Objetivos` en Sidebar, Dashboard y página.

## Implementación

### Sidebar
- Se actualizó etiqueta visual de `Tracking` a `Objetivos`.
- Se mantiene ruta real `/tracking`.

### Dashboard
- Card visual ahora se presenta como `Objetivos`.
- Muestra:
  - Score general
  - Salud
  - Desarrollo
  - Familia
- Familia se calcula desde calendario local (`source === github` + `metadata.owner === mine` para día actual).

### Página Objetivos
- Header:
  - Título: `Objetivos`
  - Subtítulo: `Score semanal`
- Secciones:
  - Salud: Agua, Comidas, Proteína, Entrenamiento, Sueño
  - Desarrollo: PMP, PyMO, Music
  - Familia: Tete (auto completado por calendario)

### Sprint 2.1A.1 — UX Refinement
- FAB móvil ajustado para no tapar contenido:
  - posición más alta
  - mayor espacio inferior seguro en layout.
- Card de score refinada y compacta:
  - `% diario`
  - `x/y hábitos`
  - menor altura visual.
- Familia refinada:
  - ya no muestra `0%`
  - muestra estado textual:
    - `Sin bloque Tete hoy`
    - `Tete ✓`
- Salud refinada:
  - Agua cuantitativa (objetivo 3L) con botones `+250ml` y `+500ml`
  - Proteína cuantitativa (objetivo 135g) con botones `+25g` y `+50g`
  - Sueño con input rápido (objetivo 8h)
- Dashboard refinado:
  - card simplificada a `Score`, `Hábitos completados`, `Salud`.

### Familia (Tete)
- Integración con calendario existente.
- Si el día corresponde a Benja (`owner: mine`), se marca completado automáticamente.

### Persistencia y UX
- Persistencia `localStorage` (store Tracking existente).
- Toggle con feedback inmediato y guardado automático.

### Preparación Heatmap/Streak (fase siguiente)
- Se centralizó cálculo de Objetivos en `src/lib/tracking.ts`:
  - `computeObjectiveDailyScore`
  - `computeObjectiveWeekSummary`
- La base semanal ya entrega:
  - promedio semanal
  - completion rate
  - días listos para streak (`>= 80`)
- El módulo queda preparado para conectar Heatmap y Streak sin refactor mayor.

## Alcance excluido
- No se implementó:
  - Heatmap
  - Streak
  - Insights
  - Analytics
  - Apple Health

## Validación
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅

## Capturas
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/objectives-desktop.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/objectives-mobile.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_05/screenshots/dashboard-objectives-card.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_01/screenshots/objectives-refined-desktop.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_01/screenshots/objectives-refined-mobile.png`
