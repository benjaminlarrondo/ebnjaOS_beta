# FITNESS_INFORMATION_ARCHITECTURE.md

## Objetivo

Reorganizar la información de Fitness para que la jerarquía visual priorice las señales más importantes sin agregar funcionalidad nueva.

## Orden prioritario

1. Fitness Score
2. Rings
3. Streak
4. Heatmap
5. Trends
6. PR Tracker

## Cambios aplicados

- Fitness Score y Recovery Score quedan arriba como puerta de entrada.
- Rings se ubican en posición central y con cuatro señales:
  - Training
  - Nutrition
  - Recovery
  - Consistency
- Streak y progreso semanal aparecen antes del análisis histórico.
- Heatmap se muestra por encima de Trends.
- PR Tracker se mueve al final de la página.

## Fuentes de datos

- `health_states`
- `fitness_workouts`
- `fitness_progress_logs`
- `fitness_prs`

## Principios

- No se agregan features nuevas.
- No se cambia la arquitectura de persistencia.
- Se mantiene `Supabase First`.
- Solo cambia el orden visual y la lectura rápida del módulo.

## Resultado esperado

- Menor fricción para entender el estado de Fitness.
- Mejor foco en las señales diarias.
- PR Tracker queda como referencia final, no como bloque dominante.
