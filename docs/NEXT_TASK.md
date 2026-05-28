# NEXT_TASK.md

## Objetivo

Alinear documentación y configuración mínima de deploy sin cambiar lógica principal de la app.

## Instrucciones

1. Revisar:
   - README.md
   - package.json
   - .github/workflows/deploy.yml
   - vite.config.ts

2. Corregir solo inconsistencias documentales o scripts faltantes relacionados con deploy.

3. Si README menciona scripts inexistentes, actualizar README o agregar script mínimo seguro en package.json.

4. No modificar módulos de app.

5. No instalar dependencias.

6. Ejecutar validaciones:
   - npm run build
   - npm run lint
   - npm run typecheck

7. Actualizar:
   - docs/STATUS.md
   - docs/CHANGELOG_AI.md

## Resultado esperado

El proyecto debe quedar con instrucciones de deploy coherentes entre README, package.json, vite.config.ts y GitHub Actions.
