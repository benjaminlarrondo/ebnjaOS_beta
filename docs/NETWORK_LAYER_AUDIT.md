# NETWORK_LAYER_AUDIT.md

## Alcance
Sprint P0.5 — Clean Network Layer.

Servicios auditados:
- GitHub
- Supabase
- Calendar

## Causa raíz detectada
1. Llamadas a `api.github.com` para discovery de archivos (`403`/rate-limit en producción).
2. Queries Supabase ejecutadas sin sesión autenticada.
3. Errores de red en segundo plano propagados como fallas visibles de sync.
4. Navegación entre rutas mientras requests seguían activas (`ERR_ABORTED`) reportadas como failed API calls.

## Cambios implementados
- `src/services/sync/networkStatusLayer.ts`
  - Estado centralizado de red por servicio.
- `src/services/sync/backgroundErrorHandling.ts`
  - `runSilently` + `safeJsonFetch`.
- `src/services/githubCalendarSync.ts`
  - Eliminado flujo principal por `api.github.com`.
  - Lectura prioritaria desde GitHub Pages y fallback a raw.
  - Degradación silenciosa en errores.
  - Salto automático de sync si Supabase no está autenticado.
- `src/lib/supabaseSync.ts`
  - `canRunSupabaseQueries()`.
  - Regla: sin sesión => no queries.
- `src/services/sync/syncManager.ts`
  - Sync en background silencioso con estados degradados.
- `src/modules/calendar/page.tsx`
  - Boot no bloqueante, sin sync agresivo remoto.

## Validación local
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅

## Auditoría producción (GitHub Pages)
- Ruta de evidencia inicial: `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_02`
- Resultado:
  - `console_errors = 0`
  - `runtime_errors = 0`
  - `failed_fetch = 0`
  - `failed_assets = 0`
  - `failed_api_calls = 10`

## Revalidación post-deploy
- Ruta de evidencia: `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_03`
- Resultado:
  - `console_errors = 1`
  - `runtime_errors = 0`
  - `failed_fetch = 0`
  - `failed_assets = 0`
  - `failed_api_calls = 9`
- Hallazgo principal:
  - Persisten requests legacy en `Calendar` hacia `api.github.com` con `403`.
  - Persisten `ERR_ABORTED` de endpoints Supabase al navegar.

## Estado
- La capa quedó endurecida.
- Fase 1.5 aún no cierra por `failed_api_calls` residuales en producción.
