# RECOVERY_INTELLIGENCE.md

## Objetivo

Transformar `Recovery Score` en un sistema de recomendación accionable basado en datos reales.

## Entradas

- `health_states`
- `fitness_workouts`
- `fitness_progress_logs`

## Fórmula

- `40%` Sueño
- `30%` Carga de entrenamiento
- `15%` Nutrición
- `15%` Consistencia

El resultado final es un score de `0-100`.

## Estados

- `80-100` → `🟢 Recuperado`
  - Recomendación: `Entrena fuerza`
- `60-79` → `🟡 Moderado`
  - Recomendación: `Entrena normal`
- `0-59` → `🔴 Fatigado`
  - Recomendación: `Prioriza recuperación`

## UI

La nueva Recovery Card muestra:

- `Recovery Score`
- `Estado`
- `Recomendación`
- `Sueño`
- `Carga`
- `Nutrición`
- `Consistencia`

## Implementación

- La lógica vive en `src/modules/fitness/fitnessMetrics.ts`.
- La card de Recovery consume el modelo accionable.
- La portada premium reutiliza el mismo estado.

## Principio

- Sin mock data.
- Sin cambiar persistencia.
- Manteniendo `Supabase First`.
