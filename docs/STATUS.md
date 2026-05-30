# STATUS.md

## Fecha
2026-05-30 19:16

## Tarea ejecutada
P0 Fix GitHub Pages routing: implementación de fallback SPA para rutas profundas (`calendar`, `tracking`) bajo `/ebnjaOS_beta/`.

## Archivos modificados
- index.html
- public/404.html
- docs/GITHUB_ROUTING_FIX.md
- docs/STATUS.md
- docs/CHANGELOG_AI.md

## Comandos ejecutados
- npm run build - OK
- npm run lint - OK
- npm run typecheck - OK
- npm run preview + smoke routing - OK

## Validación
- Build: OK
- Lint: OK
- Typecheck: OK
- Localhost rutas profundas: OK

## Errores o riesgos
- Hasta que GitHub Pages publique el nuevo build, rutas profundas seguirán en 404 en producción previa.

## Próximo paso sugerido
- Confirmar publicación GitHub Pages y revalidar `/calendar` y `/tracking` en desktop/iPhone.
