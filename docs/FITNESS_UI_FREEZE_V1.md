# FITNESS_UI_FREEZE_V1

## Objetivo
Cerrar los hallazgos abiertos de `docs/FITNESS_UX_AUDIT.md` sin agregar funcionalidades nuevas.

## Fixes aplicados

### Recovery
- Se eliminó la duplicación de Recovery en la portada premium.
- Recovery Intelligence queda centralizada en la experiencia dedicada de `RecoveryCard`.

### Heatmap adaptativo
- `<14` días con actividad real: versión compacta.
- `>=14` días con actividad real: versión completa.

### Trend Cards
- En mobile se redujo el texto secundario.
- En desktop se mantiene el detalle actual.

### PR Tracker
- Se convirtió en un bloque colapsable para bajar densidad y scroll.

## Resultado esperado
- Menos scroll en mobile.
- Mejor jerarquía visual en la portada de Fitness.
- Una única experiencia de Recovery Intelligence.
- Cards ejecutivas más limpias y legibles.

## Keep / Fix cerrados
- `KEEP`: Fitness Score, Activity Rings, Streak Engine, Next Workout.
- `FIX`: Recovery duplication, Heatmap, Trend Cards, PR Tracker.

## Readiness
- **Fitness UI Freeze v1: READY**
