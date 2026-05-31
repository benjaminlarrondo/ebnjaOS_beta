# FALLBACK_STRATEGY.md

## Objetivo
Eliminar errores visibles y degradar funcionalidades de red sin romper UX/UI cuando fallen GitHub, Supabase o Calendar.

## Estrategia aplicada

### 1) GitHub (celeste_calendar)
- Fuente primaria: `GitHub Pages` pública (`/archivo_base.json`).
- Fallback: `raw.githubusercontent.com` (`main`, luego `master`).
- Se eliminó dependencia activa de `api.github.com` para evitar `403` por rate-limit.
- Si falla todo:
  - Estado de red pasa a `offline/degraded`.
  - La UI mantiene último estado local sin romper navegación.

### 2) Supabase
- Regla activa: si no hay sesión autenticada, no ejecutar queries.
- `probeSupabaseConnection` y operaciones `pull/push` se saltan silenciosamente sin lanzar errores en UI.
- Resultado:
  - No bloquea interfaz.
  - No rompe módulos por falta de auth.

### 3) Calendar
- Sync automático no bloqueante y degradado.
- En boot del módulo se prioriza render inmediato y estado local.
- Si falla sync remoto, se muestra estado degradado no intrusivo.

### 4) Background errors
- `runSilently` para tareas asíncronas de sincronización.
- `safeJsonFetch` para evitar excepciones por red y retornar `null` en fallback.

### 5) Estado de red
- Nuevo `NetworkStatusLayer` para marcar:
  - `idle`
  - `ok`
  - `degraded`
  - `offline`
- Servicios cubiertos:
  - `github`
  - `supabase`
  - `calendar`

## Resultado esperado
- UI operativa aunque fallen integraciones.
- Sin pantalla bloqueante.
- Sin hard-crash por errores de red.
