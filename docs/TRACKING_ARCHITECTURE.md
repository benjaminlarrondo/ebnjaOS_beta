# Estado actual

## Respuestas directas
1. **¿Goals sigue siendo utilizado?**
- Sí, en estado legacy.
- `src/modules/goals/page.tsx` sigue existiendo y contiene lógica funcional completa de objetivos.
- Además, `lib/goals` sigue siendo usado por otros módulos (por ejemplo `dashboard` y `settings`).

2. **¿Tracking ya está conectado al router?**
- Sí.
- En `src/app/router.tsx` existe la ruta `path: "tracking"` que carga `src/modules/tracking/page.tsx`.

3. **¿Tracking aparece en Sidebar?**
- Sí.
- Está incluido en `src/lib/navigation.ts` (`id: "tracking", path: "/tracking"`) y en el orden fijo de `src/components/layout/Sidebar.tsx`.

4. **¿Goals aparece en Sidebar?**
- No.
- `goals` ya no está en la lista de navegación principal del Sidebar.

5. **¿Existen rutas duplicadas?**
- No hay rutas duplicadas que rendericen páginas distintas para el mismo path.
- Sí hay doble entrypoint controlado por compatibilidad:
  - `/tracking` (ruta oficial)
  - `/goals` (redirige a `/tracking` con `Navigate`).

6. **¿Existen componentes duplicados?**
- No se detectan duplicados directos dentro de `src/components/tracking/`.
- Sí hay solapamiento funcional de módulo:
  - `tracking` (placeholder base)
  - `goals` (módulo legacy funcional).

7. **¿Qué componentes ya existen dentro de `src/components/tracking/`?**
- `TrackingHealthCard.tsx`
- `TrackingGrowthCard.tsx`
- `TrackingWeeklyScore.tsx`
- `TrackingHeatmap.tsx`
- `TrackingTrendChart.tsx`

8. **¿Qué falta para reemplazar completamente Goals?**
- Migrar la lógica de `lib/goals` al dominio Tracking (o adaptarla) y conectar Tracking a datos reales.
- Reapuntar consumidores legacy (`dashboard`, `settings`) al nuevo dominio Tracking.
- Definir hooks/store/tipos propios de Tracking.
- Retirar el módulo `goals/page.tsx` cuando la migración funcional esté cerrada.

# Dependencias

## Router / Navegación
- `src/app/router.tsx`
- `src/lib/navigation.ts`
- `src/components/layout/Sidebar.tsx`

## Módulos
- `src/modules/tracking/page.tsx` (nuevo)
- `src/modules/goals/page.tsx` (legacy)

## Datos
- `src/lib/goals.ts` (persistencia local `ebnjaos-goals-v1`)

## Consumidores legacy de goals
- `src/modules/dashboard/page.tsx`
- `src/modules/settings/page.tsx`

# Flujo de navegación

1. Usuario navega a `Tracking` desde Sidebar → `/tracking`.
2. Router carga `TrackingPage` con placeholders visuales.
3. Si usuario abre `/goals`, router redirige a `/tracking`.
4. Aunque la vista principal es Tracking, la lógica de goals sigue viva en `lib/goals` y en consumidores legacy.

# Riesgos

- **Riesgo de doble dominio**: UI principal en Tracking pero estado real histórico en Goals.
- **Riesgo de drift**: evolución de Tracking sin migrar `lib/goals` puede generar incoherencias de producto.
- **Riesgo de compatibilidad semántica**: términos “Goals/Objetivos” aún presentes en código y features existentes.

# Deuda técnica

- `src/modules/goals/page.tsx` permanece como módulo funcional no consolidado.
- `lib/goals.ts` sigue siendo la fuente para partes del producto fuera de Tracking.
- Tracking carece aún de:
  - hooks propios,
  - store propio,
  - tipado de dominio,
  - integración con engine real.

# Propuesta de consolidación

1. Definir **Tracking** como único dominio canónico (Salud + Growth + objetivos equivalentes).
2. Crear capa de datos Tracking (`hooks/store/tipos`) y mapear datos de `lib/goals` durante transición.
3. Migrar consumidores (`dashboard`, `settings`) para dejar de depender de `lib/goals`.
4. Mantener `/goals -> /tracking` en fase transitoria controlada.
5. Cerrar migración eliminando uso activo de `goals` cuando Tracking Engine esté operativo.
