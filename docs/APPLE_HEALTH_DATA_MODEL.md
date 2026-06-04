# APPLE_HEALTH_DATA_MODEL

## Objetivo
Definir el modelo canónico para persistir Apple Health en ebnjaOS sin introducir Swift ni HealthKit todavía.

## Capas involucradas
Apple Health import / backfill  
↓  
`AppleHealthBackfillService`  
↓  
`AppleHealthImportRepository`  
↓  
`HealthMetricsNormalizer`  
↓  
`HealthFoundationState` / `health_states`  
↓  
Supabase (`fitness_body_metrics`, `fitness_workouts`)  
↓  
UI

## Modelo canónico de día
El snapshot de salud diario soporta:
- `water_ml`
- `protein_g`
- `sleep_hours`
- `weight_kg`
- `steps_count`
- `hrv_ms`
- `resting_hr`
- `workouts_count`

### Fuentes y reconciliación
- `source`: identifica el origen lógico del dato.
- `externalId`: identificador estable por muestra o importación.
- `externalUpdatedAt`: timestamp externo para resolver conflictos.
- `metadata`: contexto adicional sin contaminar la UI.

## Persistencia local
La importación Apple Health se cachea en:
- `ebnjaos-apple-health-import-v1`

La cache guarda un batch normalizado por fecha, de modo que:
- no se pierde un campo al importar múltiples métricas del mismo día,
- el dato más reciente gana cuando hay conflicto,
- el reload puede reconstruir el snapshot sin volver a importar.

## Supabase

### `health_states`
`health_states` sigue siendo el snapshot unificado por usuario/día en forma de JSON.  
No requiere columnas nuevas porque el nuevo modelo vive dentro de `state`, pero el snapshot ahora conserva:
- `stepsCount`
- `hrvMs`
- `restingHr`

### `fitness_body_metrics`
Columnas esperadas:
- `steps_count integer default 0`
- `hrv_ms numeric`
- `resting_hr integer`
- `source text default 'manual'`
- `external_id text`
- `external_updated_at timestamptz`
- `metadata jsonb default '{}'::jsonb`

### `fitness_workouts`
Columnas esperadas:
- `source text default 'manual'`
- `external_id text`
- `external_updated_at timestamptz`
- `metadata jsonb default '{}'::jsonb`

## Estrategia de deduplicación
1. Agrupar por `date` para el snapshot diario.
2. Usar `externalId` como identificador estable de muestra.
3. Comparar `externalUpdatedAt` para resolver colisiones.
4. Mantener `metadata` como respaldo para compatibilidad futura.

## SQL recomendado
Verificar/ejecutar la migración:
- `supabase/apple_health_metrics_persistence.sql`

## Validación
- Importación histórica por rango arbitrario.
- Cache local consistente después de reload.
- Persistencia completa de `steps_count`, `hrv_ms` y `resting_hr`.
- Preparación para bridge Apple Health futuro.

## Estado
🟡 **PARTIAL**

La capa de modelo y backfill ya está preparada. Falta la ingestión real desde Apple Health nativo para cerrar el ciclo end-to-end.
