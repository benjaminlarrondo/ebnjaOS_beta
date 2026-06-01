# CELESTE_SYNC_AUDIT.md

## Alcance
Auditoría técnica de sincronización `celeste_calendar` y persistencia de calendario en ebnjaOS, sin cambios de código.

## Fuente celeste_calendar (real)
- Endpoint primario usado por app: `https://benjaminlarrondo.github.io/celeste_calendar/archivo_base.json`
- Fallback 1: `https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/main/archivo_base.json`
- Fallback 2: `https://raw.githubusercontent.com/benjaminlarrondo/celeste_calendar/master/archivo_base.json`
- Implementación: `src/services/githubCalendarSync.ts:69`

## Estructura JSON recibida
- Top-level observado: `year`, `days`
- Día observado: `days["YYYY-MM-DD"] = { owner, exception, note }`
- Campos solicitados vs realidad:
  - `date`: no viene explícito (la fecha vive en la key del objeto `days`)
  - `owner`: sí
  - `note`: sí
  - `exception`: sí
  - `source`: no
  - `metadata`: no
- En app, `source` y `metadata` se agregan en el mapper al construir `CalendarEvent`.

## Adaptadores / archivos involucrados
- `src/services/githubCalendarSync.ts` (fuente, mapeo, dedupe por hash, sync Supabase)
- `src/services/sync/calendarSync.ts` (wrapper)
- `src/services/sync/githubSync.ts` (probe de fuente)
- `src/services/sync/syncManager.ts` (background probe de conectividad)
- `src/services/sync/backgroundErrorHandling.ts` (fetch silencioso)
- `src/lib/celesteCalendar.ts` (normalizador para render mensual)
- `src/modules/calendar/page.tsx` (render + sync manual + carga oficial para dots)
- `src/components/calendar/CalendarMonthGrid.tsx` (render visual owner/dot)

## Store calendario actual
- Store local principal UI: `db` en `src/lib/store.ts` con key `localStorage`:
  - `ebnjaos-db-v1`
  - colección calendario: `events`
- Sync remoto:
  - tabla Supabase `calendar_events` vía `src/lib/supabaseSync.ts`
- Key adicional de estado de sync:
  - `ebnjaos-calendar-last-sync` (solo timestamp) en `src/services/githubCalendarSync.ts:9`
- Estado en memoria:
  - `celesteState` en `src/modules/calendar/page.tsx` (solo para pintar dots/colors por owner)

## Render Calendar (fuentes efectivas)
- Eventos de calendario (cards/lista/week/month count): desde `db.list("events")` (`localStorage`/Supabase hidratado).
- Colores/puntos Benja-Charo por día: desde `celesteState` cargado directo del endpoint oficial (`fetchOfficialCelesteCalendarState` + `normalizeCelesteState`).
- Conclusión: el módulo mezcla dos fuentes simultáneas:
  1) `events` persistidos  
  2) `celesteState` remoto no persistido en store calendario

## Dashboard / widget Tete
- Fuente: `db.load().events` en `src/modules/dashboard/page.tsx`
- Criterio actual:
  - `nextTeteEvent`: `owner === "mine"` en metadata
  - `isFamilyDone`: `event.source==="github" && owner==="mine" && source_id===today`
- No lee `celesteState` directo; depende de eventos persistidos.

## Persistencia real observada
- Sobrevive reload:
  - `events` dentro de `ebnjaos-db-v1`
  - timestamp `ebnjaos-calendar-last-sync`
- Se pierde al reload:
  - `celesteState` en memoria (se vuelve a pedir al endpoint)
- En GitHub Pages:
  - si no hay sesión Supabase (`canRunSupabaseQueries()===false`), `syncCelesteCalendar()` no inserta eventos; devuelve `skipped-no-auth`.
  - Resultado: se visualizan dots de endpoint, pero `events` github no se consolidan en store persistente de calendario.
- En localhost:
  - con sesión Supabase activa, sí puede persistir en `calendar_events` y luego hidratar `db.events`.

## Problema raíz probable
Desacople de canal visual y canal persistente:
- Visual mensual usa `celesteState` remoto (memoria).
- Persistencia de eventos depende de Supabase autenticado.
- No existe hoy un `CalendarDomainStore` local canónico para materializar siempre el feed celeste en `localStorage` cuando Supabase no está disponible.

## Riesgos detectados
- Duplicación potencial:
  - `db.create("events")` hace `pushUpsert` async, y luego `hydrateCollections` puede sobrescribir orden/estado si la réplica remota llega en distinto timing.
- Timezone:
  - eventos celeste se crean fijos en `09:00Z-10:00Z`; el día de render mensual usa fecha local desde `Date(start_time)`.
- Owner mapping inconsistente de negocio:
  - calendario mensual pinta `hers` como Charo, pero Dashboard/Tete usa `owner==="mine"` como señal de familia/tete.
- Cache vieja:
  - no hay TTL/version explícito para cache local de dataset celeste.
- Fallback local obsoleto:
  - al fallar endpoint, `celesteState` pasa a `null`; no hay cache local del último estado oficial para mantener coloración.
- Dependencia GitHub API/hosts:
  - aunque se evita `api.github.com`, sigue dependencia a GH Pages/raw (posibles bloqueos/cors/intermitencia).
- Divergencia raw vs endpoint actual:
  - si `archivo_base.json` difiere entre GH Pages y raw temporalmente, UI puede pintar un estado y persistir otro según fuente que respondió.

## Archivos revisados
- `src/services/githubCalendarSync.ts`
- `src/services/sync/calendarSync.ts`
- `src/services/sync/githubSync.ts`
- `src/services/sync/syncManager.ts`
- `src/services/sync/backgroundErrorHandling.ts`
- `src/services/sync/networkStatusLayer.ts`
- `src/lib/celesteCalendar.ts`
- `src/lib/store.ts`
- `src/lib/supabaseSync.ts`
- `src/modules/calendar/page.tsx`
- `src/components/calendar/CalendarMonthGrid.tsx`
- `src/modules/dashboard/page.tsx`
- `src/types/calendar.ts`
- `src/app/App.tsx`
