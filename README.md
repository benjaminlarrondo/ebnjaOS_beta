# ebnjaOS Core v0.1

ebnjaOS es un second brain minimalista, mobile-first, para ordenar y ejecutar día a día en un solo lugar: tareas, calendario, fitness, notas, prompts, recursos y daily log.

## Stack
- React + Vite + TypeScript
- Tailwind CSS
- Componentes UI estilo shadcn (`components.json` + `src/components/ui`)
- Supabase Auth + Supabase Postgres (preparado)
- GitHub + GitHub Pages

## Módulos MVP
- Dashboard
- Tasks
- Calendar
- Fitness
- Notes
- Prompts
- Resources
- Daily Log
- Projects
- Settings

## Instalación
```bash
npm install
```

## Variables de entorno
Crear `.env` desde `.env.example`:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Ejecución local
```bash
npm run dev
```

## Build y preview
```bash
npm run build
npm run preview
```

## Deploy en GitHub Pages
### Opción A: Script con gh-pages
```bash
npm run deploy
```

### Opción B: GitHub Actions
Workflow incluido en `.github/workflows/deploy-gh-pages.yml`.

Configurar en GitHub:
1. `Settings > Pages`
2. `Build and deployment`: seleccionar `GitHub Actions`

## Configuración de base path
`vite.config.ts` usa base de producción para este repo:
- `/ebnjaOS_beta/`

Si renombras el repo, actualiza `repoName` en `vite.config.ts`.

## Supabase
- Cliente: `src/lib/supabase.ts`
- Esquema SQL: `supabase/schema.sql`
- Seed SQL: `supabase/seed.sql`
- RLS preparado por `user_id`

## Mock mode
Si faltan variables Supabase:
- la app entra en Mock mode
- login local habilitado
- dashboard y módulos navegables con datos mock

## Estructura
- `src/app`: app shell y router
- `src/components`: layout, cards, ui, forms
- `src/modules`: páginas por dominio
- `src/integrations/google`: preparación para Google Calendar fase 2
- `src/lib`: utilidades, constantes, store local, cliente supabase
- `src/types`: tipos de dominio
- `supabase`: schema y seed

## Google Calendar (fase futura)
Arquitectura base lista en:
- `src/integrations/google/calendar.ts`
- `src/integrations/google/oauth.ts`
- `src/integrations/google/types.ts`

Plan fase 2:
- OAuth PKCE
- scopes recomendados: `https://www.googleapis.com/auth/calendar.events`
- sincronización selectiva evitando duplicados con `google_event_id`
- Gmail fuera de alcance en v0.1

## Roadmap corto
1. Conectar CRUD principal a Supabase real
2. Mejorar vista calendario semanal/mensual
3. Refinar fitness (PRs, métricas, recovery)
4. Adjuntos en storage

## Setup Supabase sin Auth (single-user)
Para esta versión (sin login), la app usa un `user_id` fijo y políticas RLS para `anon`.

1. En Supabase SQL Editor, ejecuta:
- `supabase/schema.sql` (si no lo corriste todavía)
- `supabase/single-user-anon-setup.sql`

2. En local crea `.env`:
```env
VITE_SUPABASE_URL=https://keurxpfqsfuvinmdgvso.supabase.co
VITE_SUPABASE_ANON_KEY=TU_KEY
VITE_SINGLE_USER_ID=00000000-0000-0000-0000-000000000001
```

3. Levanta la app:
```bash
npm run dev
```

4. Verificación visual:
- Indicador inferior debe mostrar `Conectado`.
- Al crear/editar/eliminar, debe mostrar `Guardando...` y luego hora de guardado.

5. GitHub Pages (Secrets):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SINGLE_USER_ID`

Nota: este modo es solo para uso personal MVP. Para multiusuario real, reactivar auth y políticas por `auth.uid()`.
