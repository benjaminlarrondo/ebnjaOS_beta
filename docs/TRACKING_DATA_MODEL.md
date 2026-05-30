# TRACKING_DATA_MODEL.md

## Objetivo
Definir el modelo de datos definitivo para **Tracking Engine MVP** sin implementar lógica aún.

---

## 1) Categorías

Se definen dos categorías canónicas:

- `health`
  - Agua
  - Comidas
  - Proteína
  - Entrenamiento
  - Sueño

- `growth`
  - PMP
  - PyMO
  - Music

Cada hábito pertenece exactamente a una categoría.

---

## 2) Hábitos (MVP)

### Reglas base
- Cada hábito tiene:
  - identificador estable
  - unidad de medición
  - meta diaria por defecto
  - peso para score
  - estado activo/inactivo
- Registro diario por fecha (`YYYY-MM-DD`, local).

### Hábitos Health
- `water`
  - unidad: `ml`
  - meta diaria sugerida: `2500`
- `meals`
  - unidad: `count`
  - meta diaria sugerida: `3`
- `protein`
  - unidad: `g`
  - meta diaria sugerida: `140`
- `workout`
  - unidad: `boolean` (hecho/no hecho)
  - meta diaria sugerida: `1`
- `sleep`
  - unidad: `hours`
  - meta diaria sugerida: `8`

### Hábitos Growth
- `pmp`
  - unidad: `minutes`
  - meta diaria sugerida: `60`
- `pymo`
  - unidad: `minutes`
  - meta diaria sugerida: `60`
- `music`
  - unidad: `minutes`
  - meta diaria sugerida: `30`

---

## 3) Score

## 3.1 Score por hábito
Para cada hábito en un día:

- `completion = min(value / target, 1)` para unidades numéricas
- para boolean:
  - `true -> 1`
  - `false -> 0`

## 3.2 Score por categoría
- Promedio ponderado de hábitos activos de la categoría.
- Rango: `0..100`.

`categoryScore = round( sum(completion * weight) / sum(weight) * 100 )`

## 3.3 Score global diario
- Combinación de categorías:
  - `healthWeight = 0.6`
  - `growthWeight = 0.4`

`globalScore = round(healthScore * 0.6 + growthScore * 0.4)`

## 3.4 Agregados
- `weeklyScore`: promedio de los `globalScore` diarios de la semana ISO.
- `monthlyScore`: promedio de los `globalScore` diarios del mes.
- `streak`: días consecutivos con `globalScore >= threshold` (MVP sugerido `70`).

---

## 4) Tipos TypeScript

```ts
export type TrackingCategoryId = "health" | "growth";

export type TrackingHabitId =
  | "water"
  | "meals"
  | "protein"
  | "workout"
  | "sleep"
  | "pmp"
  | "pymo"
  | "music";

export type TrackingUnit = "ml" | "count" | "g" | "boolean" | "hours" | "minutes";

export type TrackingDateKey = string; // YYYY-MM-DD (local)

export type TrackingHabitDefinition = {
  id: TrackingHabitId;
  category: TrackingCategoryId;
  label: string;
  unit: TrackingUnit;
  defaultTarget: number;
  weight: number;
  active: boolean;
  order: number;
};

export type TrackingHabitLog = {
  habitId: TrackingHabitId;
  date: TrackingDateKey;
  value: number | boolean;
  target?: number; // override opcional diario
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingDailyScore = {
  date: TrackingDateKey;
  habitScores: Record<TrackingHabitId, number | null>; // 0..1 o null sin dato
  categoryScores: Record<TrackingCategoryId, number>; // 0..100
  globalScore: number; // 0..100
};

export type TrackingWeeklyAggregate = {
  weekKey: string; // YYYY-W##
  globalScoreAvg: number;
  healthScoreAvg: number;
  growthScoreAvg: number;
  adherencePct: number; // % hábitos con dato/meta cumplida
  streak: number;
};

export type TrackingMonthlyAggregate = {
  monthKey: string; // YYYY-MM
  globalScoreAvg: number;
  healthScoreAvg: number;
  growthScoreAvg: number;
  adherencePct: number;
  bestStreak: number;
};

export type TrackingState = {
  version: "v1";
  habits: TrackingHabitDefinition[];
  logs: TrackingHabitLog[];
  dailyScores: TrackingDailyScore[];
  weekly: TrackingWeeklyAggregate[];
  monthly: TrackingMonthlyAggregate[];
  lastRecomputedAt: string | null;
};
```

---

## 5) Persistencia

## 5.1 Claves locales (MVP)
- `ebnjaos-tracking-v1` → `TrackingState`

## 5.2 Estrategia
- Persistencia local inmediata por write.
- Recompute incremental:
  - al crear/editar log diario
  - recalcular día afectado
  - recalcular agregados semana/mes afectados
- Mantener `version` para migraciones futuras (`v1` -> `v2`, etc.).

## 5.3 Compatibilidad
- No reemplazar aún `lib/goals` en esta fase.
- Tracking Engine MVP convive inicialmente y luego absorbe objetivos legacy.

---

## 6) Criterios MVP de calidad de dato

- Fechas siempre en formato local `YYYY-MM-DD`.
- No permitir valores negativos.
- Validar tipo por unidad (`boolean` vs numérico).
- Si no hay log del día, score de hábito = `null` (no inventar dato).

---

## 7) Pendientes para implementación

- Definir utilidades de fecha local (sin UTC drift).
- Definir motor de recomputación (`computeDaily`, `computeWeekly`, `computeMonthly`).
- Definir capa de hooks (`useTrackingState`, `useTrackingActions`).
- Integrar visualización en `TrackingWeeklyScore`, `TrackingHeatmap`, `TrackingTrendChart`.
