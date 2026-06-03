# FITNESS_CONSISTENCY_LAYER.md

## Objetivo

Integrar en Fitness una capa de consistencia visual reutilizando los componentes ya existentes de `Tracking`.

## Componentes reutilizados

- `TrackingHeatmap`
- `TrackingStreakStats`
- `TrackingWeeklyProgress`
- `TrackingTrendChart`

## Fuente de datos

- `health_states` para agua, proteína y sueño diarios
- `fitness_workouts` para entrenamientos reales por fecha
- `fitness_progress_logs` como base conceptual de progreso histórico

## Modelo de cálculo

- Se generan 30 días consecutivos hacia atrás desde hoy.
- Cada día recibe un score `0-100`.
- El score diario pondera:
  - entrenamiento del día
  - sueño
  - agua
  - proteína
- La consistencia se mide con el umbral `>= 70`.

## Métricas expuestas

- Heatmap 30 días
- Streak actual
- Mejor streak
- Consistencia 30 días
- Weekly Progress
- Trend 30 días

## Resultado

- Fitness hereda la capa de consistencia ya probada en Goals/Tracking.
- No se duplica la lógica visual.
- La portada premium y la consistencia conviven sin romper la estructura actual.
