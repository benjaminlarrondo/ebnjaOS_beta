# FITNESS_HOME_PREMIUM.md

## Objetivo

Crear una portada premium para Fitness sin introducir datos ficticios ni alterar la identidad visual de ebnjaOS.

## Fuentes de datos

- `health_states` vía `useHealthState()` y `computeFitnessHealthMetrics()`
- `fitness_workouts` vía `db.list("workouts")`
- `fitness_progress_logs` vía `state.exerciseWeightLogs` como registro de progreso de cargas
- `fitness_prs` vía `state.prsThisCycle` y el tracker de PR existente

## Implementación

- Se agregó `src/components/fitness/FitnessHomePremium.tsx`.
- La portada se renderiza al inicio de `src/modules/fitness/page.tsx` antes de las tabs.
- Se conservan las cards, espaciado y colores actuales.
- La nueva portada prioriza:
  - Fitness Score
  - Recovery Score
  - Streak actual
  - Último entrenamiento
  - Sueño
  - Entrenamiento reciente
  - Próximo workout

## Comportamiento

- No usa mock data.
- Usa el estado ya persistido por ebnjaOS.
- Mantiene el resto del módulo Fitness intacto:
  - Rutina
  - Recovery
  - Historial
  - PR Tracker
  - Consistencia semanal

## Resultado esperado

- Una portada más clara y premium.
- Jerarquía visual más fuerte.
- Señales de rendimiento y recuperación visibles de inmediato.
