# SUPABASE_DATA_MODEL.md

## Tablas utilizadas en Sprint 2.2C

### Existentes
- `calendar_events`
- `projects`
- `tasks`
- `fitness_workouts`
- `notes`
- `prompts`
- `resources`
- `daily_logs`

### Nuevas (foundation)
- `tracking_states`
- `health_states`

## Campos clave

### `calendar_events`
- `id` (PK uuid)
- `user_id`
- `source` (`manual|github|google`)
- `source_id` (clave lógica por día para celeste)
- `source_repo`
- `source_url`
- `external_updated_at`
- `sync_status`
- `event_type`
- `metadata` (jsonb)
- `updated_at`

### `tracking_states`
- `id` (PK text, single-record pattern)
- `user_id`
- `state` (jsonb)
- `created_at`
- `updated_at`

### `health_states`
- `id` (PK text, single-record pattern)
- `user_id`
- `state` (jsonb)
- `created_at`
- `updated_at`

## Índices
- `calendar_events`:
  - `idx_calendar_events_source_source_id`
  - `idx_calendar_events_start_time`
- `tracking_states`:
  - `idx_tracking_states_user_id`
- `health_states`:
  - `idx_health_states_user_id`

## RLS / Policies
- Base:
  - `auth.uid() = user_id`
- Single-user anon (MVP):
  - `user_id::text = '00000000-0000-0000-0000-000000000001'`

## Repositories ↔ tablas
- `calendarRepository` → `calendar_events`
- `trackingRepository` → `tracking_states`
- `healthRepository` → `health_states`
- `syncRepository` → utilidades genéricas pull/push/merge

## Estrategia de sincronización
- Pull por `user_id`
- Push vía `upsert`
- Merge local/remoto: `lastUpdated wins` (`updated_at`)

## Cache local
- `ebnjaos-db-v1`
- `ebnjaos-calendar-domain-v1`
- `ebnjaos-tracking-v1`
- `ebnjaos-health-foundation-v1`

LocalStorage queda como fallback offline; Supabase como persistencia remota principal.
