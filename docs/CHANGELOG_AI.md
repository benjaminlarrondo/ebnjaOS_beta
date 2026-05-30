# CHANGELOG_AI.md

## 2026-05-30 10:05

### Ejecutado
- Se actualizó la política de validaciones en `AGENTS.md`.
- Se eliminó `npm test` del listado de validaciones obligatorias.
- Se actualizó el template de `STATUS.md` para quitar la sección de `Tests`.
- Se actualizó el pipeline en `.github/workflows/deploy.yml` para usar validaciones oficiales del proyecto:
  - `npm run build`
  - `npm run lint`
  - `npm run typecheck`

### Validación oficial del proyecto
- `npm run build`
- `npm run lint`
- `npm run typecheck`

### Nota
- No se agregó framework de testing, según instrucción.
