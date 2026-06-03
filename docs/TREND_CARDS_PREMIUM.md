# TREND_CARDS_PREMIUM

## Objetivo
Construir 5 Trend Cards ejecutivas para Fitness sin mock data y con señales reales de 30 días.

## Cards
- Peso
- Sueño
- Proteína
- Agua
- Fuerza

## Fuentes utilizadas
- `health_states`
  - `daily.weight_kg`
  - `daily.sleep_hours`
  - `daily.protein_g`
  - `daily.water_ml`
- `fitness_progress_logs`
  - historial de progreso de cargas vía `state.exerciseWeightLogs`
- `fitness_prs`
  - PR tracker persistido en `localStorage` con el mismo patrón operativo existente
- `fitness_body_metrics`
  - peso corporal actual y tendencia de salud unificada

## Comportamiento
- Cada card muestra valor actual.
- Cada card calcula tendencia 30 días comparando ventanas recientes y previas.
- La variación se presenta en unidades concretas.
- El sparkline se construye con la serie real de los últimos 30 días.

## Estrategia de fallback
- Si no hay historial suficiente, la card muestra `Sin datos`.
- Si faltan puntos intermedios, el sparkline se degrada con la última señal conocida.
- No se inyecta mock data.

## Integración
- El bloque se renderiza en `src/modules/fitness/page.tsx`.
- El componente visual vive en `src/components/fitness/FitnessTrendCards.tsx`.

## Validación esperada
- `npm run build`
- `npm run lint`
- `npm run typecheck`
