# SUPABASE_APPLE_HEALTH_AUDIT

## Alcance auditado
- `fitness_body_metrics`
- `fitness_workouts`
- `health_states`

## Estado general
🟡 **PARTIAL**

La migración Apple Health quedó representada en el repositorio y el modelo local ya soporta las nuevas métricas, pero el flujo Apple Health todavía no escribe de forma directa en Supabase desde `AppleHealthImportRepository`.

## Validación por criterio

### 1) Lectura
**PASS** en contrato y esquema:
- `fitness_body_metrics` expone los campos requeridos en `supabase/apple_health_metrics_persistence.sql`.
- `fitness_workouts` expone `source`, `external_id`, `external_updated_at`, `metadata`.
- `health_states` soporta el snapshot extendido en la capa local (`stepsCount`, `hrvMs`, `restingHr`).

### 2) Escritura
**FAIL** para Supabase remoto desde el bridge Apple Health actual:
- `AppleHealthImportRepository` persiste en `localStorage` y en `health_states` local.
- No existe un `upsert` directo hacia `fitness_body_metrics`, `fitness_workouts` o `health_states` remoto desde este flujo.

### 3) Upsert
**FAIL** en el flujo Apple Health actual:
- No hay repository Apple Health conectado a `upsertRows(...)` para estas tablas.
- El upsert solo queda definido como contrato SQL, no como operación activa del bridge.

### 4) Reload
**PASS** a nivel local:
- La cache `ebnjaos-apple-health-import-v1` reconstruye el snapshot.
- El merge por fecha evita perder datos parciales del mismo día.

### 5) Deduplicación por `external_id`
**PASS** en el modelo normalizado:
- `externalId` se conserva en el payload.
- La cache mergea por `date` y preserva el registro más reciente.

### 6) Resolución por `external_updated_at`
**PASS** en el bridge local:
- `externalUpdatedAt` se usa para comparar conflictos.
- Si el dato nuevo es más reciente, prevalece.

## Conclusión
### Lo que sí está listo
- Modelo de datos.
- Deduplicación.
- Normalización.
- Persistencia local y reload coherente.
- Contrato SQL para las nuevas columnas.

### Lo que falta
- Conectar el bridge Apple Health a Supabase con un repository real.
- Ejecutar la migración SQL en el entorno remoto.
- Validar lectura/escritura end-to-end contra Supabase.

## Resultado final
- `READ PASS`
- `WRITE FAIL`
- `UPSERT FAIL`
- `RELOAD PASS`
- `DEDUP PASS`

