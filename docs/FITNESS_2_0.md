# FITNESS_2_0.md

## Resumen
Sprint 2.3 implementa Fitness 2.0 sobre Health Foundation existente, sin tocar Calendar/Celeste/Supabase/Objetivos.

## Implementación

### 1) Fitness Score (0-100)
- Se amplió `src/modules/fitness/fitnessMetrics.ts`.
- Score compuesto por:
  - Entrenamiento
  - Sueño
  - Proteína
  - Recovery/Nutrición

### 2) Recovery Score (0-100)
- Basado en:
  - Sueño
  - Fatiga manual (`state.recovery.fatigue`)
  - Entrenamiento reciente (últimos 3 días)
- Mantiene diseño simple y extensible.

### 3) Activity Rings
- Nuevo componente: `src/components/fitness/FitnessActivityRings.tsx`.
- Tres anillos:
  - Entreno
  - Nutrición
  - Recuperación

### 4) Fitness Home (orden)
- En pestaña principal de rutina se organiza:
  1. Fitness Score
  2. Recovery Score
  3. Rutina de hoy
  4. Activity Rings
  5. PR Tracker
  6. Historial / consistencia

### 5) PR Tracker
- Nuevo componente: `src/components/fitness/FitnessPRTracker.tsx`.
- Ejercicios:
  - Deadlift
  - Back Squat
  - Front Squat
  - Clean
  - Bench Press
- Muestra:
  - Último PR
  - Variación mensual
  - Tendencia simple (↗ / → / ↘)
- Persistencia oficial:
  - `src/lib/repositories/fitnessPRRepository.ts`
  - `fitness_prs` como source of truth
- `localStorage` queda solo como cache offline con key legacy:
  - `ebnjaos-fitness-pr-v1`

### 6) Dashboard Fitness Card
- Actualizada `src/components/dashboard/FitnessWidget.tsx`.
- Ahora muestra:
  - Fitness Score
  - Recovery Score
  - Rutina de hoy (compacta)
- `src/modules/dashboard/page.tsx` calcula métricas desde Health Layer + estado fitness local.

## Validaciones
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅

## Capturas
- `fitness-2-desktop.png`
- `fitness-2-mobile.png`
- `dashboard-fitness-card.png`
