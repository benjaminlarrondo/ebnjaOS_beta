# CELESTE_PERSISTENCE_PLAN.md

## Objetivo de diseño
Definir persistencia definitiva, correlativa y consistente para celeste_calendar en ebnjaOS:

`celeste_calendar → CelesteSyncAdapter → CalendarDomainStore → localStorage cache → Supabase (futuro) → Calendar UI → Dashboard Tete`

## Arquitectura propuesta

### 1) CelesteSyncAdapter
Responsable de:
- consumir endpoint primario/fallback,
- validar shape,
- normalizar a formato canónico interno,
- entregar snapshot versionado (`fetchedAt`, `sourceUrl`, `datasetHash`).

No renderiza UI, no escribe directamente en componentes.

### 2) CalendarDomainStore (canónico)
Nueva capa de dominio (única fuente de verdad local) con:
- `calendarDayOwnership` (dato diario celeste por fecha),
- `calendarEvents` (eventos derivados/materializados para agenda),
- `syncMeta` (último sync, fuente, estado, hash, errores).

La UI (Calendar + Dashboard) debe leer solo desde este store.

### 3) localStorage cache
Persistir snapshot de dominio en key dedicada (ejemplo):
- `ebnjaos-calendar-domain-v1`

Incluir:
- `schemaVersion`
- `lastSuccessfulSyncAt`
- `sourceFingerprint`
- `daysByDate`
- `eventsBySourceId`

### 4) Supabase futuro (no bloqueante)
Cuando exista sesión/auth:
- push upsert async de cambios,
- pull/hydrate con resolución de conflictos por `source_id + hash`,
- nunca bloquear render inicial.

## Estructura de datos canónica propuesta

```ts
type CelesteDayCanonical = {
  date: string; // YYYY-MM-DD
  owner: "mine" | "hers" | "neutral";
  note: string;
  exception: boolean;
  source: "celeste_calendar";
  sourceId: string; // date
  hash: string; // estable por date+owner+note+exception
  fetchedAt: string;
};

type CalendarDomainState = {
  version: "v1";
  days: Record<string, CelesteDayCanonical>;
  events: Record<string, CalendarEvent>; // key = sourceId (o sourceId+type)
  sync: {
    status: "idle" | "syncing" | "ok" | "degraded" | "error";
    lastSuccessAt: string | null;
    lastAttemptAt: string | null;
    sourceUrl: string | null;
    sourceKind: "gh_pages" | "raw_main" | "raw_master" | "cache";
    datasetHash: string | null;
    error: string | null;
  };
};
```

## Estrategia de deduplicación
- Clave primaria lógica: `source = "github" + source_repo + source_id(date)`.
- Upsert determinístico por `source_id`.
- Actualización solo si `hash` cambió.
- Regla anti-duplicado:
  - si existe mismo `source_id` con distinto `id` físico, conservar el más reciente y marcar el otro para cleanup.

## Estrategia de cache
- Cache read-through:
  1. render inmediato desde `ebnjaos-calendar-domain-v1`,
  2. sync en background,
  3. commit atómico al store.
- TTL sugerido: 15 min para reintento online, pero sin invalidar render local.
- Guardar `datasetHash` para detectar no-cambios sin reprocesar.

## Estrategia fallback offline
- Si falla red:
  - usar último snapshot local válido,
  - estado `degraded` visible en header, sin romper Calendar/Dashboard.
- Si no hay snapshot previo:
  - mostrar estado vacío explícito + CTA de reintento.

## Estrategia GitHub Pages safe
- Evitar dependencia a auth para persistencia base.
- Persistencia mínima obligatoria: localStorage canónico.
- Supabase solo como capa opcional de replicación.
- No rutas absolutas locales; endpoint configurable por `env` con defaults seguros.
- Reintentos silenciosos con backoff para GH Pages/raw.

## Validaciones necesarias (antes de implementación)
1. **Paridad JSON→Store**
   - todos los `days` del JSON deben existir en `daysByDate`.
2. **Paridad Store→UI**
   - CalendarMonthGrid y Dashboard Tete deben resolver contra el mismo store.
3. **Reload consistency**
   - mismo resultado antes/después de `F5`.
4. **Sin auth Supabase**
   - datos celeste siguen persistiendo en local.
5. **Con auth Supabase**
   - no duplica por `source_id`.
6. **Timezone**
   - mapping por `date` (no por hora UTC) para ownership diario.
7. **Fallback**
   - caída GH Pages/raw no limpia ni invalida cache previa.

## Plan por fases recomendado
- Fase A: introducir `CalendarDomainStore` + migración de lectura UI.
- Fase B: adaptar `CelesteSyncAdapter` a escritura canónica local primero.
- Fase C: integrar replicación Supabase opcional con reconcile por hash.
- Fase D: auditoría automática de correlación (`JSON vs store vs UI`) en CI/QA.

## Recomendación de implementación
**GO**, con prioridad alta, porque hoy existe inconsistencia estructural entre visualización remota y persistencia local/remota.
