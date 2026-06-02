# SUPABASE_FIRST_AUDIT.md

## Fecha
2026-06-01

## 1) Arquitectura anterior
- **Lectura inicial**: `useTrackingEngine` levantaba estado desde `localStorage` (`loadTrackingState`, `loadHealthState`) y luego sincronizaba.
- **Escritura**: UI actualizaba estado local y en paralelo empujaba a Supabase.
- **Problema**: podían ocurrir sobrescrituras por concurrencia (mutaciones rápidas con snapshot stale), dejando valores inconsistentes en `health_states`.

## 2) Arquitectura nueva (Supabase First)
- **Lectura inicial**: `syncTrackingState(loadTrackingState())` y `syncHealthState(loadHealthState())` priorizan remoto si existe.
- **Escritura**:
  - UI -> `useTrackingEngine.setValue`.
  - `Repository` (`pushHealthState` / `pushTrackingState`) persiste primero en Supabase.
  - `syncHealthState` / `syncTrackingState` rehidrata estado desde remoto.
- **Cache local**: `saveTrackingState` y `saveHealthState` quedan como cache offline, no como fuente principal cuando hay remoto.

## 3) Cambios realizados
- `src/hooks/useTrackingEngine.ts`
  - Se agregaron colas de mutación serializadas (`healthMutationChainRef`, `trackingMutationChainRef`) para evitar race conditions.
  - `setValue` ahora serializa escritura remota + relectura remota.
  - `toggleChecklist` ya no hace `push` directo con estado stale; reutiliza `setValue`.
- Repositorios ya existentes usados como capa de persistencia remota:
  - `src/lib/repositories/healthRepository.ts`
  - `src/lib/repositories/trackingRepository.ts`

## 4) Auditoría de flujo real (Agua/Proteína/Sueño)
- **UI**: `src/modules/tracking/page.tsx` (botones `+250/+500`, `+25/+50`, input sueño).
- **Hook**: `src/hooks/useTrackingEngine.ts` (`setValue`).
- **Store**: `upsertHealthDay` + cache local (`src/lib/health/healthStore.ts`).
- **Repository**: `pushHealthState` / `syncHealthState` (`src/lib/repositories/healthRepository.ts`).
- **Supabase**: tabla `health_states` (registro único por usuario).

## 5) Evidencia remota disponible
- Archivo de validación generado: `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_12/supabase_first_validation.json`.
- En esa corrida:
  - `tracking_states`: accesible y con datos.
  - `health_states`: accesible y con datos.
  - `calendar_events`: accesible y con datos.
  - lectura cruzada desktop/mobile emulado: presente.

## 6) Riesgos detectados
- Persisten riesgos de consistencia si hay múltiples interacciones ultra-rápidas entre tabs/dispositivos sin estrategia de resolución por campo.
- `syncHealthState` usa modelo de registro único (`health-single-state-v1`): conflictos concurrentes multi-dispositivo podrían requerir control por `updated_at` a nivel de campo o merge por fecha.
- `localStorage` sigue existiendo como cache y debe tratarse explícitamente como fallback offline.

## 7) Estado
🟡 PARTIAL

### Motivo
- El flujo ya está orientado a Supabase-first y se corrigió el punto principal de race local.
- Falta evidencia fresca y completa de la prueba objetivo explícita (Agua 3000 ml desde navegador A visible en navegador B e iPhone físico) luego del ajuste final.
