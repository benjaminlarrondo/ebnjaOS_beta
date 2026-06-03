# ROOT_CAUSE_FIX.md

## Fecha
2026-06-02

## Causa raíz
`useTrackingEngine.setValue()` reconstruía el estado de salud desde `loadHealthState()`, y `DashboardPage` todavía leía `loadHealthState()` directamente en render. Eso permitía que el valor visible y el valor remoto divergieran después de un write o reload.

## Cambios aplicados
- `src/hooks/useTrackingEngine.ts`
  - `setValue()` ahora usa el estado en memoria más reciente.
  - se agregaron refs vivas para evitar snapshots stale.
- `src/lib/repositories/healthRepository.ts`
  - `syncHealthState()` ahora compara `updated_at` remoto vs `updatedAt/lastSyncAt` local.
  - si la mutación local es más nueva, gana local y se persiste en Supabase.
- `src/modules/dashboard/page.tsx`
  - dejó de leer `loadHealthState()` directo en render.
  - consume `healthState` desde el hook hidratado.
- `src/modules/fitness/page.tsx`
  - dejó de leer `loadHealthState()` directo en render.
  - consume `healthState` desde el hook hidratado.
- `src/hooks/useHealthState.ts`
  - nuevo hook para hidratar salud con sync en background y cache local como fallback.

## Flujo final
```text
UI
↓
Store / hook hidratado
↓
Repository
↓
Supabase
↓
Store / hook actualizado
↓
UI
```

## Verificación esperada
- `Agua = 3000` persiste en Supabase.
- F5 conserva el mismo valor visible.
- Un navegador nuevo lee el mismo valor desde Supabase.

## Riesgos
- Persisten riesgos si una mutación se ejecuta mientras otra todavía está en vuelo.
- La consistencia depende de que `updated_at` siga siendo monotónico entre writes.
