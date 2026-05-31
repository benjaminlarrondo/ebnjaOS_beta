# NETWORK_CLEANUP.md

## Sprint
`1.5.4b — Network Cleanup`

## Objetivo
Cerrar la capa de red para evitar errores de consola y fallas de API en operación normal.

## Problemas atacados
- `GitHub API 403` por consumo de `api.github.com`.
- `failed_api_calls` en `calendar_events`, `fitness_workouts`, `projects`.
- `ERR_ABORTED` derivados de sincronizaciones en background no esenciales.

## Implementación aplicada
- `src/services/sync/syncManager.ts`
  - Se removió sync remoto agresivo en arranque.
  - El arranque ahora usa estado degradado para Supabase por defecto en background.
  - Se mantiene probe liviano de GitHub vía fuentes públicas.
- `src/services/githubCalendarSync.ts`
  - Flujo de lectura con prioridad:
    1. GitHub Pages (`archivo_base.json`)
    2. Raw GitHub (`main`)
    3. Raw GitHub (`master`)
  - Sin dependencia activa de `api.github.com`.
  - Si Supabase no está autenticado, retorna `skipped-no-auth` sin queries.
- `src/lib/supabaseSync.ts`
  - Guarda `canRunSupabaseQueries()` para impedir queries sin sesión.
- `src/modules/calendar/page.tsx`
  - Boot no bloqueante y degradado.
  - Sync remoto solo bajo acción explícita (botón), no en boot automático.

## Resiliencia
- Si GitHub falla: fallback de fuente y degradación silenciosa.
- Si Supabase falla/no auth: no rompe UI, no bloquea módulos.
- Si endpoint no existe: estado degradado sin excepción visible.

## Validación local
- `npm run build` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test` ⚠️ script no existe

## Validación producción
- Evidencia en carpeta incremental:
  - `~/Desktop/ebnjaOS_PRODUCTION_AUDIT/rev_04`
- Resultado final se consigna desde:
  - `audit/console_audit_post_fix.json`
  - `report/POST_FIX_CONSOLE_AUDIT.md`
