# TRACKING_IMPLEMENTATION.md

## Arquitectura utilizada

### Capas
- **Dominio Tracking (local)**: `src/lib/tracking.ts`
  - catálogo de hábitos (health + growth)
  - persistencia localStorage (`ebnjaos-tracking-v1`)
  - utilidades de fecha local (`YYYY-MM-DD`)
  - motor de score diario y semana actual
- **Hook de aplicación**: `src/hooks/useTrackingEngine.ts`
  - carga/guardado automático de estado
  - acciones de escritura (`setValue`, `toggleChecklist`)
  - selectores derivados (`todayScore`, `weekScores`, hábitos por categoría)
- **UI Tracking**: `src/modules/tracking/page.tsx` + `src/components/tracking/*`
  - pestañas: Hoy / Semana / Salud / Focus
  - checklist interactivo y vistas específicas por categoría
- **Dashboard**: `src/components/dashboard/TrackingTodayWidget.tsx`
  - card compacta con score de hoy y acceso a `/tracking`

## Modelo de datos

Se implementa modelo MVP local (sin Supabase):
- `TrackingState`
  - `version`
  - `habits[]`
  - `logs` por fecha local y hábito
  - `updatedAt`

Cada hábito define:
- `id`, `category`, `label`, `unit`, `defaultTarget`, `weight`, `active`, `order`.

Log diario:
- fecha local `YYYY-MM-DD`
- valor por hábito (`number | boolean`).

## Scoring implementado

### Score por hábito
- Numérico: `completion = min(value / target, 1)`
- Booleano: `true -> 1`, `false -> 0`

### Score por categoría
- Promedio ponderado por `weight` de hábitos activos
- Salida `0..100`

### Score global diario
- `global = round(health * 0.6 + growth * 0.4)`

### Semana (heatmap)
- Cálculo de lunes a domingo de semana actual
- Cada día usa `globalScore` para intensidad visual.

## Funcionalidad entregada (Sprint 2.1A)

1. **Vista Hoy**
- Score diario (global + salud + focus)
- Checklist interactivo (toggle rápido)
- Persistencia automática en localStorage

2. **Vista Semana**
- Heatmap semanal estilo GitHub
- Trend chart semanal

3. **Vista Salud**
- Agua, Comidas, Proteína, Entreno, Sueño
- Inputs interactivos y toggle en entreno

4. **Vista Focus**
- PMP, PyMO, Music
- Inputs de minutos

5. **Dashboard**
- Card compacta `Tracking Hoy` con acceso directo a módulo

## Limitaciones actuales

- Persistencia solo localStorage (sin sync remoto/Supabase).
- Sin agregados históricos persistidos (weekly/monthly como snapshots formales).
- Sin objetivos personalizados por usuario (usa `defaultTarget`).
- Sin analytics avanzados (tendencia es visual básica de semana actual).
- Sin hooks/store globales compartidos fuera de Tracking (MVP encapsulado).
