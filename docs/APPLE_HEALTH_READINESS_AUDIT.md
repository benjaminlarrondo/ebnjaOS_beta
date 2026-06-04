# APPLE_HEALTH_READINESS_AUDIT

## Estado de readiness
🟡 **PARTIAL**

La arquitectura actual soporta la base de Apple Health para **Sleep**, **Weight** y **Workouts**, pero todavía no está lista para una integración completa sin agregar columnas/tablas y una capa de importación remota.

## Alcance revisado
- `health_states`
- `fitness_workouts`
- `fitness_progress_logs`
- `fitness_body_metrics`

## Validación por métrica

### 1) Sleep
- Soporte actual: **sí**, vía `health_states.daily.sleep_hours`.
- Persistencia remota: **parcial**. No existe tabla `health_states` en Supabase.
- Gap: falta modelo canónico remoto para sincronizar días Apple Health.

### 2) Weight
- Soporte actual: **sí**, vía `health_states.daily.weight_kg` y `fitness_body_metrics.body_weight`.
- Persistencia remota: **parcial**.
- Gap: falta trazabilidad de origen (`external_id`, `source`, `metadata`) para evitar sobrescrituras ambiguas.

### 3) Steps
- Soporte actual: **sí en modelo local**, vía `health_states.daily.steps_count`.
- Persistencia remota: **no**.
- Gap: `fitness_body_metrics` no tiene columna de pasos y `health_states` no existe como tabla remota.

### 4) HRV
- Soporte actual: **no**.
- Gap: no hay columna ni en `health_states` ni en `fitness_body_metrics`.

### 5) Resting HR
- Soporte actual: **no**.
- Gap: no hay columna ni en `health_states` ni en `fitness_body_metrics`.

### 6) Workouts
- Soporte actual: **sí**, vía `fitness_workouts`.
- Persistencia remota: **sí**, pero sin metadatos de fuente Apple Health.
- Gap: faltan columnas de procedencia y reconciliación (`source`, `external_id`, `external_updated_at`, `metadata`).

## Gaps detectados
- Falta la tabla `health_states` en Supabase.
- Faltan columnas remotas para:
  - `steps_count`
  - `hrv_ms`
  - `resting_hr`
- Faltan columnas de reconciliación para Apple Health:
  - `external_id`
  - `source`
  - `external_updated_at`
  - `metadata`
- Falta una capa de bridge/import que normalice Apple Health sin tocar Swift/HealthKit todavía.

## Migraciones SQL necesarias

### A. Crear tabla `health_states`
```sql
create table if not exists health_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  water_ml numeric default 0,
  protein_g numeric default 0,
  sleep_hours numeric default 0,
  weight_kg numeric default 0,
  steps_count integer default 0,
  hrv_ms numeric,
  resting_hr integer,
  source text not null default 'manual',
  external_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);
```

### B. Extender `fitness_body_metrics`
```sql
alter table fitness_body_metrics
  add column if not exists steps_count integer default 0,
  add column if not exists hrv_ms numeric,
  add column if not exists resting_hr integer,
  add column if not exists source text default 'manual',
  add column if not exists external_id text,
  add column if not exists external_updated_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;
```

### C. Extender `fitness_workouts`
```sql
alter table fitness_workouts
  add column if not exists source text default 'manual',
  add column if not exists external_id text,
  add column if not exists external_updated_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb;
```

### D. Índices recomendados
```sql
create index if not exists idx_health_states_user_date on health_states(user_id, date);
create index if not exists idx_fitness_body_metrics_user_date on fitness_body_metrics(user_id, date);
create index if not exists idx_fitness_workouts_user_date on fitness_workouts(user_id, date);
```

## Estimación de implementación
- **Bridge y modelo canónico**: 1 sprint corto
- **Migraciones SQL + validación**: 0.5 sprint
- **Adaptador Apple Health futuro (iOS)**: 1 sprint adicional

## Veredicto
- **🟡 PARTIAL**
- No hace falta refactor grande de UI/store para empezar, pero sí hace falta cerrar el contrato remoto antes de considerar Apple Health “ready”.
