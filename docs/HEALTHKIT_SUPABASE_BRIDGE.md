# HEALTHKIT_SUPABASE_BRIDGE

## Objetivo
Conectar el companion nativo de HealthKit con el backend Supabase existente usando el snapshot canónico de Apple Health como puente.

## Flujo
1. `HealthKitManager` solicita permisos y carga 30 días de datos reales.
2. `HealthKitNormalizer` convierte muestras HealthKit a un `HealthSnapshot` canónico.
3. `HealthFoundationBridgeBuilder` transforma el snapshot en:
   - `HealthFoundationState`
   - `HealthStateRow`
   - `FitnessBodyMetricRow[]`
   - `FitnessWorkoutRow[]`
4. `SupabaseClient` hace upsert idempotente en:
   - `health_states`
   - `fitness_body_metrics`
   - `fitness_workouts`
5. `SyncEngine` guarda un `SyncReport` con el resultado final.

## Tablas destino

### `health_states`
- Upsert por `id = health-single-state-v1`
- Contiene el estado diario canónico del health foundation de ebnjaOS

### `fitness_body_metrics`
- Upsert por `user_id + external_id`
- Usa `external_updated_at` para resolver reimports
- Campos clave:
  - `steps_count`
  - `hrv_ms`
  - `resting_hr`
  - `source`
  - `metadata`

### `fitness_workouts`
- Upsert por `user_id + external_id`
- Usa `external_updated_at` para resolver duplicados
- Campos clave:
  - `source`
  - `metadata`

## Idempotencia
- Cada fila tiene un `external_id` estable.
- Antes del upsert se compara `external_updated_at` con el estado remoto.
- Una reimportación segura no sobrescribe datos más recientes.

## Snapshot Upload
El companion exporta un JSON canónico con:
- snapshot bruto de HealthKit
- `HealthFoundationState` derivado
- filas de `health_states`
- filas de `fitness_body_metrics`
- filas de `fitness_workouts`

## Sync Report
El `SyncReport` incluye:
- estado final
- timestamps de inicio/fin
- métricas y workouts subidos
- deduplicación aplicada
- último sync remoto detectado

## Fuera de alcance
- `HKObserverQuery`
- Background Delivery
- Apple Watch sync
- Widgets
- AI

## Estado
🟢 **READY FOR PHASE 3.0C IMPLEMENTATION**
