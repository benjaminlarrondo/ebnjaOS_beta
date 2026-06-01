# HEALTH_INTEGRATION.md

## Resumen
Sprint 2.2A conecta la capa `Health Foundation` con `Objetivos`, `Dashboard` y `Fitness`, manteniendo persistencia local y sin nuevas integraciones externas.

## Arquitectura aplicada
- `Health` (`src/lib/health/`) queda como fuente para métricas de agua, proteína y sueño.
- `Objetivos` consume esas métricas vía `useTrackingEngine` con estado combinado (`tracking + health`).
- `Dashboard` incorpora card `Health Today` con valores de hoy.
- `Fitness` calcula `Fitness Score` y `Recovery Score` con `src/modules/fitness/fitnessMetrics.ts`.

## Cambios implementados
- Migración de lectura/escritura de `water`, `protein`, `sleep` hacia `healthStore`:
  - `src/hooks/useTrackingEngine.ts`
- Card nueva en dashboard:
  - `src/components/dashboard/HealthTodayWidget.tsx`
  - integración en `src/modules/dashboard/page.tsx`
- Capa de métricas para fitness:
  - `src/modules/fitness/fitnessMetrics.ts`
  - integración en `src/modules/fitness/page.tsx`

## Scoring implementado
- `Fitness Score`:
  - Agua 20%
  - Proteína 30%
  - Sueño 20%
  - Entrenamiento 30%
- `Recovery Score`:
  - Sueño 70%
  - Proteína 30%

## Limitaciones actuales
- Persistencia local solamente (`localStorage`).
- `workouts_count` en score usa dato Health con respaldo del conteo local de workouts del día.
- Sin Apple Health/Whoop/Garmin/Strava (fuera de alcance).

## Capturas
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/health-dashboard.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/health-objectives.png`
- `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04/screenshots/fitness-score.png`

## Validación
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅
