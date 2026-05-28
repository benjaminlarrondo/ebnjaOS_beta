# AGENTS.md — ebnjaOS_beta

## Rol de Codex

Codex actúa como ejecutor técnico local. ChatGPT actúa como cerebro estratégico.

## Reglas obligatorias

1. Antes de modificar código, inspeccionar:
   - estructura del proyecto
   - package.json
   - archivos relacionados con la tarea
   - docs/PROJECT_BRIEF.md
   - docs/NEXT_TASK.md

2. No reescribir arquitectura completa sin instrucción explícita.

3. Hacer cambios mínimos, trazables y consistentes con el estilo existente.

4. No borrar archivos ni mover carpetas sin justificación.

5. No instalar dependencias nuevas salvo que la tarea lo exija.

6. No editar secretos ni exponer valores de `.env`.

7. Después de modificar, ejecutar validaciones disponibles:
   - npm run build
   - npm run lint
   - npm run typecheck
   - npm test

8. Si un comando no existe, registrarlo en `docs/STATUS.md`.

9. Al terminar, actualizar siempre:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Formato obligatorio de STATUS.md

```md
# STATUS.md

## Fecha
YYYY-MM-DD HH:mm

## Tarea ejecutada
Descripción breve.

## Archivos modificados
- archivo 1
- archivo 2

## Comandos ejecutados
- comando
- resultado

## Validación
- Build:
- Lint:
- Typecheck:
- Tests:

## Errores o riesgos
- riesgo 1

## Próximo paso sugerido
- paso concreto