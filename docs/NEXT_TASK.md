# NEXT_TASK.md

## Objetivo

Rediseñar el módulo Fitness / TRAINO para que sea más minimalista, funcional y parecido a la referencia visual generada, sin perder la lógica actual del proyecto.

## Referencia visual

Usar como dirección UX/UI:
- dashboard fitness limpio
- cards grandes y respiradas
- fondo claro
- bordes suaves
- acento azul/violeta
- jerarquía visual simple
- menos formularios visibles de golpe
- foco en resumen, progreso y acciones rápidas

## Estado actual a considerar

El módulo actual ya tiene:
- Semana actual
- Plan y sesiones realizadas
- Day tracker
- Quick log
- Tracking semanal
- Tracking mensual
- Progreso de cargas
- Consistencia semanal
- Recovery
- Progreso de fuerza
- Progresión 6 semanas
- Plan base de entrenamiento

## Instrucciones

1. Revisar:
   - src/modules/fitness/page.tsx
   - src/components/fitness/*
   - src/data/fitnessPlan.ts
   - src/lib/store.ts

2. Simplificar la vista principal:
   - mantener arriba resumen ejecutivo
   - mostrar 3 a 4 métricas clave
   - priorizar: sesiones, peso, cargas, recovery
   - mover formularios largos a secciones colapsables o secundarias
   - reducir ruido visual
   - mantener funcionalidad existente

3. Mejorar UX:
   - mobile-first
   - cards limpias
   - botones claros
   - jerarquía tipo dashboard
   - mantener labels en español
   - no dejar información crítica escondida

4. Restricciones:
   - no borrar lógica existente
   - no romper persistencia actual
   - no instalar dependencias
   - no cambiar rutas
   - no modificar Supabase
   - cambios pequeños y verificables

5. Validar:
   - npm run build
   - npm run lint
   - npm run typecheck

6. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

- Fitness queda más minimalista y usable.
- La vista principal se parece más a un dashboard ejecutivo.
- Las funciones actuales siguen disponibles.
- La interfaz queda lista para iterar métricas, gráficos y registros.
