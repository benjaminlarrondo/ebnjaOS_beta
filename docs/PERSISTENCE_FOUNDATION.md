# PERSISTENCE_FOUNDATION.md

## Sprint 2.2C — Persistence Foundation

## Objetivo cumplido
Se implementó base de persistencia Supabase para:
- Tracking
- Health
- Calendar (CalendarDomainStore ↔ `calendar_events`)

Manteniendo `localStorage` como cache/fallback offline.

## Repository Layer
Nueva carpeta:
- `src/lib/repositories/`

Archivos:
- `src/lib/repositories/syncRepository.ts`
- `src/lib/repositories/trackingRepository.ts`
- `src/lib/repositories/healthRepository.ts`
- `src/lib/repositories/calendarRepository.ts`

## Modo single-user (sin login)
- Se mantiene `VITE_SINGLE_USER_ID`.
- `canRunSupabaseQueries()` ahora valida acceso real a tablas (`projects`) en vez de sesión auth estricta.
- Permite operar con estrategia `anon + RLS single-user` cuando está configurada.

## Tracking persistido
Entidad persistida remota:
- tabla `tracking_states`
- registro único `id = tracking-single-state-v1`
- payload `state` (jsonb) con:
  - agua, proteína, sueño, comidas
  - PMP, PyMO, Music

## Health persistido
Entidad persistida remota:
- tabla `health_states`
- registro único `id = health-single-state-v1`
- payload `state` (jsonb) con:
  - Water, Protein, Sleep, Workout, Weight, Activity

## Calendar persistido
- `CalendarDomainStore` sigue siendo canónico local.
- `calendarRepository` sincroniza con `calendar_events`.
- Merge:
  - `source_id` como clave lógica
  - `lastUpdated wins` por `updated_at`
- Dedupe:
  - no duplica mismo `source_id` cuando solo cambia metadata/hash.

## Estrategia de sincronización
- `pull`: lectura de Supabase por `user_id`
- `push`: upsert por conflicto (`id`)
- `merge`: `lastUpdated wins` (local vs remoto)

Aplicado en:
- Tracking (`syncTrackingState`)
- Health (`syncHealthState`)
- Calendar (`syncCalendarDomainState`)

## Estrategia offline
- Fuente primaria de continuidad: `localStorage`.
- Si falla Supabase:
  - no rompe UI
  - mantiene estado local
  - sincroniza cuando vuelva conectividad.

## Migraciones SQL añadidas
- `supabase/persistence_foundation.sql`
  - crea tablas:
    - `tracking_states`
    - `health_states`
  - índices por `user_id`
  - RLS y políticas `auth.uid()` + opcional `anon single-user`.

## Validación
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅

## Pendientes
- Convergencia multi-dispositivo completa (estrategia de conflictos avanzada por dominio).
- Telemetría de drift local/remoto.
- Evolución de payloads `state` desde jsonb a modelos más normalizados cuando escale.
