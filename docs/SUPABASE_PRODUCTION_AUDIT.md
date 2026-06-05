# SUPABASE_PRODUCTION_AUDIT

## Objetivo
Validar el estado real de las tablas críticas de Supabase antes de seguir con el roadmap nativo de HealthKit Companion.

## Método de verificación
- Lecturas reales contra Supabase con `anon` usando `.env`.
- Inspección de repositorio, migraciones SQL y repositories.
- Validación explícita de columnas con `select` por tabla.

> Limitación: con el cliente `anon` no es posible inspeccionar directamente `pg_indexes` / `pg_policies` del catálogo del sistema.  
> Por eso, los índices y políticas se consideran **verificados por contrato de repo/migración**, pero no enumerados directamente en runtime.

## Estado ejecutivo
🟡 **READY WITH GAPS**

## Matriz por tabla

| Tabla | Existencia live | Columnas live | Índices | Upserts | Deduplicación | `external_id` | `external_updated_at` |
|---|---|---|---|---|---|---|---|
| `fitness_prs` | VERIFIED | VERIFIED | PARTIAL | VERIFIED | VERIFIED (por `id` determinístico) | FAIL | FAIL |
| `fitness_workouts` | VERIFIED | VERIFIED | VERIFIED (por migración/repo) | VERIFIED | VERIFIED (por `user_id + external_id`) | VERIFIED | VERIFIED |
| `fitness_body_metrics` | VERIFIED | VERIFIED | VERIFIED (por migración/repo) | VERIFIED | VERIFIED (por `user_id + external_id`) | VERIFIED | VERIFIED |
| `health_states` | VERIFIED | VERIFIED | VERIFIED (por migración/repo) | VERIFIED | VERIFIED (por `id` single-record) | N/A | N/A |
| `tracking_states` | VERIFIED | VERIFIED | VERIFIED (por migración/repo) | VERIFIED | VERIFIED (por `id` single-record) | N/A | N/A |
| `calendar_events` | VERIFIED | VERIFIED | VERIFIED (por repo/schema) | VERIFIED | VERIFIED (por `source_id` + `source`) | N/A | VERIFIED |

## Hallazgos por tabla

### `fitness_prs`
#### VERIFIED
- La tabla existe y responde en Supabase.
- El repository ya hace `upsert` a `fitness_prs`.
- El tracker y `fitnessTrends` ya leen desde `fitness_prs` vía repository.

#### GAP
- La tabla no tiene `external_id` ni `external_updated_at`.
- La deduplicación se hace con `id` determinístico, no con `external_id`.
- `localStorage` queda solo como cache offline en el repository.

#### Conclusión
- **PARTIAL**

### `fitness_workouts`
#### VERIFIED
- La tabla existe y responde en Supabase.
- `AppleHealthImportRepository` escribe con `upsert`.
- La migración `supabase/apple_health_metrics_persistence.sql` agrega:
  - `source`
  - `external_id`
  - `external_updated_at`
  - `metadata`
- Existe estrategia de deduplicación por `user_id + external_id`.

#### Conclusión
- **VERIFIED**

### `fitness_body_metrics`
#### VERIFIED
- La tabla existe y responde en Supabase.
- La migración `supabase/apple_health_metrics_persistence.sql` agrega:
  - `steps_count`
  - `hrv_ms`
  - `resting_hr`
  - `source`
  - `external_id`
  - `external_updated_at`
  - `metadata`
- La estrategia de `upsert` y deduplicación usa `user_id + external_id`.

#### Conclusión
- **VERIFIED**

### `health_states`
#### VERIFIED
- La tabla existe y responde en Supabase.
- `healthRepository` hace `upsert` al snapshot único.
- El snapshot local ya soporta:
  - `stepsCount`
  - `hrvMs`
  - `restingHr`

#### GAP
- No usa `external_id` ni `external_updated_at`; es un snapshot único por usuario.

#### Conclusión
- **VERIFIED** para persistencia del snapshot, **N/A** para external-id.

### `tracking_states`
#### VERIFIED
- La tabla existe y responde en Supabase.
- `trackingRepository` hace `upsert` al snapshot único.

#### GAP
- No usa `external_id` ni `external_updated_at`; es un snapshot único por usuario.

#### Conclusión
- **VERIFIED** para persistencia del snapshot, **N/A** para external-id.

### `calendar_events`
#### VERIFIED
- La tabla existe y responde en Supabase.
- El repository sincroniza con `calendar_events` y escribe `metadata`.
- La rama de Celeste usa `source_id` como deduplicación funcional y `external_updated_at` como timestamp de conflicto.

#### GAP
- No existe `external_id` en este modelo; la clave deduplicante real es `source_id`.

#### Conclusión
- **VERIFIED** para `external_updated_at` y dedup funcional, **N/A** para `external_id`.

## Validación de código / contrato

### Upserts
- `fitness_prs` → `src/lib/repositories/fitnessPRRepository.ts`
- `fitness_workouts` / `fitness_body_metrics` / `health_states` → `src/lib/health/appleHealth/AppleHealthImportRepository.ts`, `src/lib/repositories/healthRepository.ts`
- `tracking_states` → `src/lib/repositories/trackingRepository.ts`
- `calendar_events` → `src/lib/repositories/calendarRepository.ts`

### Deduplicación
- `fitness_prs` → `id` determinístico.
- `fitness_workouts` / `fitness_body_metrics` → `user_id + external_id`.
- `health_states` / `tracking_states` → `id` único de snapshot.
- `calendar_events` → `source_id` + `source` / `metadata.domainHash` como contrato de dominio.

## Resultado final
### VERIFIED
- `fitness_workouts`
- `fitness_body_metrics`
- `health_states`
- `tracking_states`
- `calendar_events` (con dedup funcional por `source_id`)

### PARTIAL
- `fitness_prs` (porque no soporta `external_id` / `external_updated_at`)
- Índices/políticas: no enumerables directamente desde el cliente `anon`

### FAIL
- Ningún fallo de lectura de tabla en la validación realizada.

## Recomendación
1. Mantener `fitness_prs` como repository Supabase-first, pero documentar que su deduplicación es por `id` y no por `external_id`.
2. Si se quiere unificar completamente el contrato de auditoría, considerar una migración futura para `fitness_prs` con `external_id` / `external_updated_at`.
3. Para auditorías externas de índices/policies, ejecutar una revisión SQL con acceso de catálogo o usar un job de verificación con permisos elevados.

