# SUPABASE_DATA_FLOW.md

## Flujo objetivo (Supabase First)

```text
UI (Tracking)
  ↓
useTrackingEngine.setValue()
  ↓
Repository (pushHealthState / pushTrackingState)
  ↓
Supabase (health_states / tracking_states)
  ↓
Repository (syncHealthState / syncTrackingState)
  ↓
Store React
  ↓
UI render
```

## Flujo actual implementado

### Lectura inicial
1. `useTrackingEngine` inicia con cache local para render inmediato.
2. `bootSync` ejecuta:
   - `syncTrackingState(loadTrackingState())`
   - `syncHealthState(loadHealthState())`
3. Si existe remoto, remoto sobrescribe estado local en memoria.

### Escritura Salud (agua/proteína/sueño)
1. Usuario interactúa en `src/modules/tracking/page.tsx`.
2. `setValue` encola mutación (`healthMutationChainRef`) para evitar solapes.
3. Se sincroniza base remota actual.
4. Se aplica patch del día.
5. `pushHealthState(nextHealth)` -> Supabase.
6. `syncHealthState(nextHealth)` -> estado remoto final.
7. `setHealthState(remote)` y cache local.

### Escritura Tracking no-health
1. `setValue` encola mutación (`trackingMutationChainRef`).
2. Construye `nextTracking` desde estado base.
3. `pushTrackingState(nextTracking)`.
4. `syncTrackingState(nextTracking)`.
5. `setState(remote)` y cache local.

## Tablas involucradas
- `tracking_states`
- `health_states`
- `calendar_events`

## LocalStorage (rol actual)
- `ebnjaos-tracking-v1`
- `ebnjaos-health-foundation-v1` (via `HEALTH_LAYER_KEY`)
- `ebnjaos-calendar-domain-v1`

Rol: **cache offline / hidratación inicial**. No debe prevalecer sobre remoto cuando Supabase responde correctamente.

## Recomendaciones siguientes
1. Agregar `updated_at` por fecha en payload de salud para merge determinista multi-dispositivo.
2. Incorporar verificación de versionado (`etag/hash`) para evitar write-skew.
3. Registrar auditoría automática de write/read cross-device por sprint.
