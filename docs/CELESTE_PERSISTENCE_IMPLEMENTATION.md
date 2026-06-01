# CELESTE_PERSISTENCE_IMPLEMENTATION.md

## Resumen
Se implementó Fase A + Fase B del plan de persistencia celeste:
- `CalendarDomainStore` canónico en `localStorage`
- `CelesteSyncAdapter` con endpoint primario + fallbacks
- Calendar UI y Dashboard Tete migrados a leer ownership/eventos desde dominio local
- Sync local-first (sin dependencia obligatoria de Supabase)

## Flujo implementado
`celeste_calendar` → `CelesteSyncAdapter` → `CalendarDomainStore` → `Calendar UI` + `Dashboard Tete`

En background:
- `startBackgroundSync()` ejecuta `syncCelesteCalendar()` y actualiza dominio local.

En Calendar al abrir módulo:
- ejecuta sync local-first no bloqueante
- si falla red, conserva snapshot previo y marca estado degradado.

## Archivos creados
- `src/lib/calendarDomain/calendarDomainTypes.ts`
- `src/lib/calendarDomain/calendarDomainStore.ts`
- `src/lib/calendarDomain/calendarDomainHash.ts`
- `src/lib/calendarDomain/calendarDomainSelectors.ts`
- `src/services/celeste/CelesteSyncAdapter.ts`

## Archivos modificados
- `src/services/githubCalendarSync.ts`
- `src/modules/calendar/page.tsx`
- `src/components/calendar/CalendarMonthGrid.tsx`
- `src/modules/dashboard/page.tsx`
- `src/services/sync/syncManager.ts`

## Persistencia local
- Nueva key canónica: `ebnjaos-calendar-domain-v1`
- Estructura persistida:
  - `schemaVersion`
  - `lastSuccessfulSyncAt`
  - `sourceFingerprint`
  - `daysByDate`
  - `eventsBySourceId`
  - `syncMeta`

## Estrategia de fallback
- Si endpoint falla y existe cache:
  - no borra datos
  - `syncMeta.status = degraded`
  - Calendar y Dashboard siguen operativos con snapshot local.
- Si endpoint falla y no existe cache:
  - se devuelve estado vacío con error de sync (sin crash UI).

## Deduplicación y timezone
- Dedupe por `sourceId = YYYY-MM-DD` y comparación por `hash`.
- Solo actualiza registro diario si el hash cambia.
- Ownership diario se resuelve por `date` canónica, no por conversión de `Date(start_time)`.

## Validación de reload consistency
1. Abrir `Calendar`.
2. Verificar ownership (puntos Benja/Charo).
3. Hacer `F5`.
4. Verificar que ownership persiste sin depender de Supabase.
5. Verificar `Dashboard` widget Tete (próximo bloque + estado hoy).

## Pendientes (Supabase futuro)
- Replicación bidireccional dominio↔Supabase con reconciliación por `sourceId+hash`.
- Estrategia de conflicto multi-dispositivo.
- Telemetría de drift entre cache local y remoto.
