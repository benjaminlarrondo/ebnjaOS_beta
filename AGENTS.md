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

## Errores o riesgos
- riesgo 1

## Próximo paso sugerido
- paso concreto

## vexp <!-- vexp v2.0.25 -->

**MANDATORY: use `run_pipeline` - do NOT grep or glob the codebase.**
vexp returns pre-indexed, graph-ranked context in a single call.

### Workflow
1. `run_pipeline` with your task description - ALWAYS FIRST (replaces all other tools)
2. Make targeted changes based on the context returned
3. `run_pipeline` again only if you need more context

### Available MCP tools
- `run_pipeline` - **PRIMARY TOOL**. Runs capsule + impact + memory in 1 call.
  Auto-detects intent. Includes file content. Example: `run_pipeline({ "task": "fix auth bug" })`
- `get_skeleton` - compact file structure
- `index_status` - indexing status
- `expand_vexp_ref` - expand V-REF placeholders in v2 output

### Agentic search
- Do NOT use built-in file search, grep, or codebase indexing - always call `run_pipeline` first
- If you spawn sub-agents or background tasks, pass them the context from `run_pipeline`
  rather than letting them search the codebase independently

### Smart Features
Intent auto-detection, hybrid ranking, session memory, auto-expanding budget.

### Multi-Repo
`run_pipeline` auto-queries all indexed repos. Use `repos: ["alias"]` to scope. Run `index_status` to see aliases.
<!-- /vexp -->
