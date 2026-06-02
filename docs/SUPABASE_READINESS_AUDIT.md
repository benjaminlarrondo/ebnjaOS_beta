# SUPABASE_READINESS_AUDIT.md

## Resultado ejecutivo
Estado actual de readiness para migrar persistencia a Supabase:

🟡 **PARTIAL**

Motivo: infraestructura base y tablas existen, pero el flujo runtime de la app requiere sesión Auth para ejecutar queries (`canRunSupabaseQueries`) y hoy no existe login/session flow implementado.

## 1) Configuración
- Archivo detectado: `.env` (sí existe)
- `.env.local`: no existe
- Variables presentes:
  - `VITE_SUPABASE_URL` ✅
  - `VITE_SUPABASE_ANON_KEY` ✅
  - `VITE_SINGLE_USER_ID` ✅
- `vite.config.ts` usa `base: "/ebnjaOS_beta/"` (correcto para GitHub Pages)
- Cliente Supabase:
  - `src/lib/supabase.ts`
  - `createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })`

## 2) Conexión
- Cliente inicializa correctamente en código.
- Validación HTTP con `apikey` anon:
  - `GET /rest/v1/projects?select=id&limit=1` → `200`
  - `GET /auth/v1/settings` → `200`
- Proyecto Supabase responde y está activo.

Nota: `GET /rest/v1/` devolvió `401` con mensaje de endpoint reservado a `service_role`; no bloquea el uso normal de REST por tablas.

## 3) Auth
- No existe UI de login/logout ni flujo explícito de auth en app.
- Único uso auth en runtime:
  - `src/lib/supabaseSync.ts` → `supabase.auth.getSession()`
- `canRunSupabaseQueries()` exige sesión válida; si no hay sesión:
  - no ejecuta pull/push
  - módulos siguen en local
- `VITE_SINGLE_USER_ID` se usa como owner lógico en payloads.

Conclusión auth: existe capacidad técnica de sesión persistente en cliente, pero no existe onboarding de sesión en producto.

## 4) Tablas
Fuente auditada: `supabase/schema.sql`

Tablas principales definidas:
- `profiles`
- `projects`
- `tasks`
- `calendar_events`
- `fitness_plans`
- `fitness_workouts`
- `fitness_exercises`
- `fitness_progress_logs`
- `fitness_body_metrics`
- `fitness_prs`
- `notes`
- `prompts`
- `resources`
- `daily_logs`
- `tags`
- `attachments`
- `integrations`

### calendar_events (detalle)
- PK: `id uuid primary key`
- Columnas relevantes:
  - `user_id`, `title`, `description`, `start_time`, `end_time`, `location`
  - `source`, `google_event_id`, `source_id`, `source_repo`, `source_url`
  - `external_updated_at`, `sync_status`, `event_type`, `metadata jsonb`
  - `created_at`, `updated_at`
- Índices:
  - `idx_calendar_events_source_source_id (source, source_id)`
  - `idx_calendar_events_start_time (start_time)`

## 5) Uso actual por módulo

### Escriben a Supabase (vía `db` → `pushUpsertCollectionItem`)
- Calendar events (`events` → `calendar_events`)
- Tasks (`tasks`)
- Fitness workouts (`workouts` → `fitness_workouts`)
- Notes (`notes`)
- Prompts (`prompts`)
- Resources (`resources`)
- Daily logs (`logs` → `daily_logs`)
- Projects (`projects`)

### No escriben hoy a Supabase (local-first)
- Objetivos/Tracking (`ebnjaos-tracking-v1`)
- Health Foundation (`ebnjaos-health-foundation-v1`)
- Calendar Domain (`ebnjaos-calendar-domain-v1`)
- Fitness PR Tracker (`ebnjaos-fitness-pr-v1`)

## 6) RLS / Policies
- `supabase/schema.sql` habilita RLS en tablas principales.
- Políticas base en schema:
  - `*_select_own`: `auth.uid() = user_id`
  - `*_mod_own`: `auth.uid() = user_id`
- Script alternativo MVP:
  - `supabase/single-user-anon-setup.sql`
  - crea políticas para rol `anon` usando `user_id` fijo (`VITE_SINGLE_USER_ID`)

Riesgo:
- Si está aplicado `schema.sql` sin auth session activa, consultas fallan por RLS.
- Si está aplicado `single-user-anon-setup.sql`, anon puede operar para `user_id` fijo.

## 7) Sincronización actual (qué viaja vs local)

### Viaja a Supabase hoy (solo si `canRunSupabaseQueries()` true)
- collections de `db`: tasks, events, workouts, notes, prompts, resources, logs, projects

### Permanece localStorage
- `ebnjaos-db-v1`
- `ebnjaos-calendar-domain-v1`
- `ebnjaos-health-foundation-v1`
- `ebnjaos-tracking-v1`
- `ebnjaos-goals-v1`
- `ebnjaos-fitness-pr-v1`
- `ebnjaos-sync-queue-v1`

## Hallazgos críticos de readiness
1. **Auth gap**: no hay login/session UX, pero la capa de sync exige sesión.
2. **Dual persistence**: base funcional sigue siendo localStorage para módulos core.
3. **RLS bifurcado**: dos estrategias de políticas posibles (auth.uid vs anon single-user).
4. **Migración incompleta**: no existe repository layer unificado; sync está acoplado al `db`.

## Veredicto
🟡 **PARTIAL**

No bloqueado a nivel infraestructura, pero no listo para “migrar toda la persistencia” sin cerrar auth + repositorios + estrategia única RLS.
