# APPLE_HEALTH_REMOTE_REPOSITORY

## Objetivo
Conectar el puente Apple Health al backend de Supabase para que la importación deje de depender de `localStorage` como persistencia principal.

## Arquitectura
Apple Health import / backfill  
↓  
`AppleHealthImportRepository`  
↓  
`health_states` + `fitness_body_metrics` + `fitness_workouts`  
↓  
UI / reload / cross-device

## Qué hace el repository
- Normaliza el payload Apple Health.
- Guarda cache local como respaldo offline.
- Persiste el snapshot unificado en `health_states`.
- Persiste métricas de cuerpo en `fitness_body_metrics`.
- Persiste actividad/imports de entrenamiento en `fitness_workouts`.
- Expone helpers de lectura remota para reconstrucción y validación.

## Estrategia de escritura remota
- `health_states`: upsert por `id = health-single-state-v1`.
- `fitness_body_metrics`: upsert por `user_id + external_id`.
- `fitness_workouts`: upsert por `user_id + external_id`.

## Estrategia de deduplicación
- `external_id` estable por día/muestra.
- `external_updated_at` para decidir qué versión gana.
- `metadata` para preservar contexto sin contaminar la UI.

## Estrategia offline
- `localStorage` queda como cache secundaria.
- Si Supabase falla, la app conserva el último import local.
- La UI sigue pudiendo reconstruirse desde `health_states` local.

## Lectura
- `pullAppleHealthRemoteSnapshot()` permite leer:
  - `health_states`
  - `fitness_body_metrics`
  - `fitness_workouts`
- `hydrateAppleHealthFromRemote()` prioriza remoto y cae a cache.

## Requisitos SQL
La migración `supabase/apple_health_metrics_persistence.sql` debe estar aplicada, incluyendo los índices únicos:
- `uidx_fitness_body_metrics_user_external_id`
- `uidx_fitness_workouts_user_external_id`

## Validación
- `READ PASS`
- `WRITE PASS`
- `UPSERT PASS`
- `RELOAD PASS`
- `DEDUP PASS`

## Estado
🟢 **READY**

El repository ya escribe y lee desde Supabase con cache offline como respaldo.
