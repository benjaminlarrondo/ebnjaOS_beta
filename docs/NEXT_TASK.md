# NEXT_TASK.md

## Objetivo

Transformar Home/Dashboard en el cockpit principal de benjaOS: visual, minimalista, ejecutivo y altamente escaneable.

## Dirección UX/UI

La Home debe sentirse como:
- sistema operativo personal
- dashboard ejecutivo calmado
- Apple Health + Linear + WHOOP + Notion Calendar
- modular
- visual
- mobile-first
- premium

## Problema actual

El dashboard actual todavía se siente:
- modular
- funcional
- tipo app de productividad

Debe evolucionar hacia:
- overview del día
- estado personal
- foco
- métricas
- quick insights
- widgets vivos

## Instrucciones

1. Revisar:
   - src/modules/dashboard/page.tsx
   - src/components/cards/*
   - src/lib/navigation.ts
   - AppLayout y layout actual

2. Rediseñar Dashboard/Home:
   - Hero superior ejecutivo
   - saludo/contexto del día
   - widgets prioritarios
   - métricas visuales
   - quick actions minimalistas
   - mejor jerarquía visual

3. Priorizar:
   - menos texto
   - más estado visual
   - cards grandes
   - números protagonistas
   - spacing generoso
   - gráficos simples o placeholders visuales
   - foco en escaneabilidad

4. Dashboard recomendado:
   - Hero principal
   - Estado del día
   - Fitness summary
   - Calendar preview
   - Focus / priorities
   - Quick actions
   - Insights o trends simples

5. Restricciones:
   - no romper módulos existentes
   - no instalar dependencias
   - no cambiar lógica de negocio
   - no romper navegación
   - cambios pequeños y verificables

6. Validar:
   - npm run build
   - npm run lint
   - npm run typecheck

7. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

- Home se siente como el centro operativo de benjaOS.
- Mucho más visual y premium.
- Mejor lectura mobile-first.
- Base correcta para widgets futuros e integraciones reales.
