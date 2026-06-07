# SPRINT_6_8_WEEKLY_REVIEW

## Objetivo
Agregar un motor semanal de feedback, analytics de uso y exportación del review semanal desde la superficie `Review`.

## Implementación
- `WeeklyReviewEngine` en `src/lib/weeklyReview.ts`
- Panel semanal reusable en `src/components/review/WeeklyReviewPanel.tsx`
- Exportación `Week Review` en formato Markdown descargable

## Qué muestra
- Score semanal
- Fortalezas
- Áreas de foco
- Próximo paso
- Uso semanal comparado con la semana previa
- Checklist semanal

## Validación
- Build: PASS
- Lint: PASS
- Typecheck: PASS
- Runtime local: PASS

## Riesgos
- La captura de uso es local-first y todavía depende de la calidad de los datos de la semana.
- La exportación es útil como salida humana, pero no reemplaza todavía una sincronización de reporting dedicada.

