# CONSISTENCY_ENGINE.md

## Sprint
`2.1B — Consistency Engine`

## Objetivo
Implementar Heatmap + Streak + Weekly Progress + Trend sobre la base de Objetivos, manteniendo persistencia local y responsive.

## Componentes implementados

### 1) Heatmap 30 días
- Archivo: `src/components/tracking/TrackingHeatmap.tsx`
- Escala visual por score diario:
  - `0%`
  - `25%`
  - `50%`
  - `75%`
  - `100%`
- Paleta alineada a BenjaOS.

### 2) Streak Engine
- Archivo: `src/components/tracking/TrackingStreakStats.tsx`
- Métricas:
  - 🔥 Streak actual
  - 🏆 Mejor histórico
  - 📈 Consistencia 30 días

### 3) Weekly Progress
- Archivo: `src/components/tracking/TrackingWeeklyProgress.tsx`
- Barra minimalista con porcentaje semanal.

### 4) Trend 30 días
- Archivo: `src/components/tracking/TrackingTrendChart.tsx`
- Sparkline SVG simple (30 días) + promedio.

## Engine y datos
- Cálculo diario y semanal centralizado en `src/lib/tracking.ts`.
- Cálculo 30d y streak integrado en `src/modules/tracking/page.tsx`.
- `Familia` sigue integrado con calendario (`owner=mine`).
- Persistencia: `localStorage` (tracking store actual).

## Responsive
- Validado en Desktop e iPhone desde la misma página `/tracking`.

## Exclusiones (no implementado en este sprint)
- Insights
- Apple Health
- Whoop
- Garmin
- Strava

## Validación
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅

## Capturas
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/heatmap-desktop.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/heatmap-mobile.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/streak-desktop.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02/screenshots/streak-mobile.png`
