# GITHUB_PAGES_ROOT_CAUSE.md

## Causa raíz
- GitHub Pages sirve sitios estáticos y no resuelve rutas SPA profundas (`/calendar`, `/tracking`, etc.) a `index.html`.
- Aunque existía `404.html` para fallback SPA, la auditoría P0 exigía `404 = 0` también a nivel de respuesta HTTP en rutas internas.
- Resultado: navegación podía recuperarse en cliente, pero deep links seguían devolviendo `404` en la capa estática.

## Archivo exacto afectado
- `package.json` (script de build para preparar rutas estáticas)
- `scripts/prepare-gh-pages-routes.mjs` (nuevo generador de entradas `index.html` por ruta)

## Corrección aplicada
- Se creó `scripts/prepare-gh-pages-routes.mjs` para copiar `dist/index.html` a:
  - `dist/calendar/index.html`
  - `dist/tracking/index.html`
  - `dist/fitness/index.html`
  - `dist/tasks/index.html`
  - `dist/notes/index.html`
  - `dist/projects/index.html`
  - `dist/settings/index.html`
  - `dist/qa/index.html`
  - `dist/prompts/index.html`
  - `dist/resources/index.html`
  - `dist/review/index.html`
- Se integró en build:
  - `npm run build` => `vite build && node scripts/prepare-gh-pages-routes.mjs`
- Se mantiene compatibilidad con:
  - `vite.config.ts` (`base: "/ebnjaOS_beta/"`)
  - `src/app/router.tsx` (`basename: import.meta.env.BASE_URL`)
  - `public/404.html` fallback SPA.

## Validación final
- Local (`npm run preview`) con base GitHub Pages:
  - `/` => 200
  - `/calendar` => 200
  - `/tracking` => 200
  - `/fitness` => 200
  - `/tasks` => 200
  - `/notes` => 200
  - `/projects` => 200
  - `/settings` => 200
- Validaciones de calidad:
  - `npm run build` OK
  - `npm run lint` OK
  - `npm run typecheck` OK
  - `npm test` no existe (sin framework de tests aún).

## Nota de despliegue
- El estado en producción depende de la propagación del deploy de GitHub Pages posterior al push de este cambio.

## Validación en producción (post-deploy)
- URL auditada: `https://benjaminlarrondo.github.io/ebnjaOS_beta/`
- Resultado final de rutas críticas:
  - `/` => 200
  - `/calendar` => 200
  - `/tracking` => 200
  - `/fitness` => 200
  - `/tasks` => 200
  - `/notes` => 200
  - `/projects` => 200
  - `/settings` => 200
- Evidencia técnica adicional:
  - `docs/github_pages_route_validation.json`
