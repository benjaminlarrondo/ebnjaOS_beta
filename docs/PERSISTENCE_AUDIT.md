# PERSISTENCE_AUDIT.md

## Fecha
2026-06-07 11:24

## Estado ejecutivo
🟡 PARTIAL

## Resumen de release
- Fitness: READY
- Brain: PARTIAL
- Agenda: PARTIAL

## Conclusión
- Fitness persiste sus entidades principales en Supabase.
- Brain todavía depende de stores locales para parte de su base.
- Agenda opera bien a nivel web, pero EventKit/iPhone físico queda pendiente de validación.

## Objetivo
Auditar si Tracking y Health persisten realmente en Supabase o solo en localStorage, con traza exacta:

UI  
↓  
Hook  
↓  
Repository  
↓  
Supabase

## Resumen ejecutivo
Clasificación general: 🟡 **Persistencia parcial**

- **Health**: flujo hacia repository existe (push remoto intentado), pero puede fallar silenciosamente.
- **Tracking** (para Agua/Proteína/Sueño): se guarda local y en Health; **no actualiza el estado tracking remoto de forma directa** en ese flujo.
- El sistema **degrada a localStorage** cuando falla remoto (sin romper UI).

---

## Flujo real por campo

## 1) Agua

### UI
- `src/modules/tracking/page.tsx`
  - botón `+250ml` / `+500ml` llama `setValue("water", ...)`.

### Hook
- `src/hooks/useTrackingEngine.ts`
  - `setValue()` detecta `habitId === "water"`.
  - ejecuta `setHealthState(prev => upsertHealthDay(...water_ml...))`.
  - **no** modifica `trackingState.logs` en esta ruta.

### Repository
- `useEffect([healthState])`:
  - `saveHealthState(healthState)` (localStorage)
  - `void pushHealthState(healthState).catch(() => {})`
- `pushHealthState` en `src/lib/repositories/healthRepository.ts`:
  - upsert a tabla `health_states`.

### Supabase
- Si `health_states` existe + políticas permiten insert/upsert: persiste.
- Si falla (tabla/RLS/permisos), error se captura en `.catch(() => {})` del hook y **no escala**.

---

## 2) Proteína
Mismo flujo que Agua:
- UI: `setValue("protein", ...)`
- Hook: `upsertHealthDay(...protein_g...)`
- Repository: `pushHealthState`
- Supabase: `health_states` (best effort, fallo silencioso posible)

---

## 3) Sueño
Mismo flujo que Agua/Proteína:
- UI input numérico `setValue("sleep", ...)`
- Hook: `upsertHealthDay(...sleep_hours...)`
- Repository: `pushHealthState`
- Supabase: `health_states` (best effort, fallo silencioso posible)

---

## Qué pasa con Tracking remoto en estos 3 casos

Para Agua/Proteína/Sueño, el flujo va por `healthState`.

- `trackingState` no cambia en `setValue()` para esos 3 hábitos.
- `pushTrackingState(state)` se ejecuta en `useEffect([state])`, pero ese effect no se dispara por cambios exclusivos en `healthState`.
- Resultado: en esos casos, **tracking_states puede no reflejar cambios recientes** de agua/proteína/sueño aunque UI sí los muestre (porque UI los lee desde Health).

Esto explica la brecha observada entre datos visibles y persistencia remota tracking.

---

## Dónde se corta exactamente el flujo

### Corte A (lógico, enrutamiento de dato)
- En `useTrackingEngine.setValue()`, agua/proteína/sueño se derivan a Health y no mutan Tracking.
- Impacto: `tracking_states` no recibe necesariamente ese update.

### Corte B (operativo, silencioso)
- Push remoto en hook se ejecuta con `.catch(() => {})`:
  - `pushHealthState(...)` y `pushTrackingState(...)` fallan sin surfacear error a UI.
- Impacto: puede quedar “parece guardado” (local) pero remoto falló.

### Corte C (infra/tabla/política)
- Si `tracking_states`/`health_states` no existen o RLS bloquea, repository no persiste.
- Impacto: solo localStorage.

---

## Revisión de componentes auditados
- Hook:
  - `src/hooks/useTrackingEngine.ts`
- Repositories:
  - `src/lib/repositories/trackingRepository.ts`
  - `src/lib/repositories/healthRepository.ts`
- Store local:
  - `src/lib/health/healthStore.ts`
  - `src/lib/tracking.ts`
- Inicialización de sync:
  - `src/app/App.tsx`
- Cliente / conectividad:
  - `src/lib/supabase.ts`
  - `src/lib/supabaseSync.ts`

---

## Clasificación final
- Tracking (agua/proteína/sueño): 🟡 **Persistencia parcial**
- Health (agua/proteína/sueño): 🟡 **Persistencia parcial**
- Calendar (ruta separada en `calendar_events`): 🟢 persistencia remota activa (según auditorías previas)

## Estado global de este alcance (Tracking + Health)
🟡 **Persistencia parcial**
