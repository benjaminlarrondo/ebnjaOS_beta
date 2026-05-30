# BOOT_AUDIT.md

## 1. Qué bloqueaba el render
El render inicial estaba bloqueado por una compuerta `hydrating` en `App`, que mostraba la pantalla:
- "Cargando ebnjaOS..."
- "Sincronizando estado local y calendario..."

Mientras `hydrating === true`, no se montaba el router ni la UI principal.

## 2. Archivo exacto
- `src/app/App.tsx`

Bloqueo previo:
- `await probeSupabaseConnection()`
- `await hydrateAllFromSupabase()` (con race timeout)
- render condicionado por `if (hydrating) ...`.

## 3. Solución aplicada
Se cambió la secuencia de arranque a no bloqueante:

1. `loadLocalState()` implícito (estado local ya disponible vía stores/localStorage)
2. `renderUI()` inmediato (`RouterProvider` sin compuertas de loading)
3. `startBackgroundSync()` asíncrono en segundo plano

Cambios concretos:
- Eliminada pantalla de loading bloqueante en `src/app/App.tsx`.
- Se inicia sincronización con `setTimeout(..., 0)` post-mount.
- Nuevo motor de sync en `src/services/sync/`:
  - `syncManager.ts`
  - `supabaseSync.ts`
  - `calendarSync.ts`
  - `githubSync.ts`
- Hook reusable de estado: `src/hooks/useSyncStatus.ts`.
- Header global (`PlatformStatusBadge`) actualizado para estados no bloqueantes:
  - `🟡 SINCRONIZANDO`
  - `🟢 ACTUALIZADO`
  - `🔴 ERROR`

## 4. Tiempo de carga antes
Antes, el primer render interactivo esperaba sincronización inicial en foreground.
En práctica podía tardar hasta el timeout configurado (~3.5s) o más según red/servicios.

## 5. Tiempo de carga después
Ahora el router/UI renderiza inmediatamente (primer paint interactivo sin esperar sync remoto).
La sincronización corre en background y actualiza estado de plataforma sin bloquear la interfaz.
