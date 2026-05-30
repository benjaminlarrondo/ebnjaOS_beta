# GITHUB_ROUTING_FIX.md

## Causa raíz
GitHub Pages sirve contenido estático y, al refrescar rutas profundas (`/calendar`, `/tracking`), intenta resolver archivos físicos en esas rutas.

Sin fallback SPA, esas rutas devuelven `404` aunque el router cliente sí tenga las rutas definidas.

## Verificación de configuración

### Router
- Archivo: `src/app/router.tsx`
- Estado: `basename: import.meta.env.BASE_URL` ✅

### Vite base
- Archivo: `vite.config.ts`
- Estado: `base: "/ebnjaOS_beta/"` ✅

### main
- Archivo: `src/main.tsx`
- Estado: bootstrap estándar React, sin hardcode de origen local ✅

## Archivos modificados
- `index.html`
  - Se agrega script de restauración de ruta desde `sessionStorage` para retorno SPA.
- `public/404.html`
  - Se agrega fallback de GitHub Pages que redirige cualquier deep-link al root del proyecto preservando la ruta original.

## Fallback SPA implementado
Flujo:
1. Usuario entra a `https://.../ebnjaOS_beta/calendar`.
2. GitHub Pages entrega `404.html`.
3. `404.html` guarda ruta original y redirige a `/ebnjaOS_beta/`.
4. `index.html` restaura la ruta con `history.replaceState(...)`.
5. React Router resuelve correctamente `calendar` o `tracking`.

## Validación

### Localhost (preview)
- `/` ✅
- `/calendar` ✅
- `/tracking` ✅
- Desktop ✅
- iPhone ✅

### GitHub Pages (antes de push/deploy de este fix)
- `/` ✅
- `/calendar` ❌ (`404`)
- `/tracking` ❌ (`404`)

> Esto es esperado mientras el deploy remoto aún no incluye `404.html` y el script de restauración.

## Resultado esperado post-deploy
En `https://benjaminlarrondo.github.io/ebnjaOS_beta/`:
- `/` ✅
- `/calendar` ✅
- `/tracking` ✅
- Desktop ✅
- iPhone ✅
