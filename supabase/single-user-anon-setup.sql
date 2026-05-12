-- ebnjaOS single-user setup (sin auth)
-- WARNING: esto es para MVP personal. No usar así en multiusuario.

-- 1) User id fijo de la app
-- Debe coincidir con VITE_SINGLE_USER_ID
-- 00000000-0000-0000-0000-000000000001

create extension if not exists "pgcrypto";

-- 2) Asegurar RLS activa en tablas principales
alter table if exists profiles enable row level security;
alter table if exists projects enable row level security;
alter table if exists tasks enable row level security;
alter table if exists calendar_events enable row level security;
alter table if exists fitness_plans enable row level security;
alter table if exists fitness_workouts enable row level security;
alter table if exists fitness_exercises enable row level security;
alter table if exists fitness_progress_logs enable row level security;
alter table if exists fitness_body_metrics enable row level security;
alter table if exists fitness_prs enable row level security;
alter table if exists notes enable row level security;
alter table if exists prompts enable row level security;
alter table if exists resources enable row level security;
alter table if exists daily_logs enable row level security;
alter table if exists tags enable row level security;
alter table if exists attachments enable row level security;
alter table if exists integrations enable row level security;

-- 3) Limpiar políticas previas (si existen)
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles','projects','tasks','calendar_events','fitness_plans','fitness_workouts',
    'fitness_exercises','fitness_progress_logs','fitness_body_metrics','fitness_prs',
    'notes','prompts','resources','daily_logs','tags','attachments','integrations'
  ])
  loop
    execute format('drop policy if exists %I_select_own on %I', t, t);
    execute format('drop policy if exists %I_mod_own on %I', t, t);
    execute format('drop policy if exists %I_anon_select_single on %I', t, t);
    execute format('drop policy if exists %I_anon_insert_single on %I', t, t);
    execute format('drop policy if exists %I_anon_update_single on %I', t, t);
    execute format('drop policy if exists %I_anon_delete_single on %I', t, t);
  end loop;
end $$;

-- 4) Crear políticas anon single-user por tabla
-- Solo permite operar sobre user_id fijo

do $$
declare
  t text;
  fixed_user text := '00000000-0000-0000-0000-000000000001';
begin
  for t in select unnest(array[
    'profiles','projects','tasks','calendar_events','fitness_plans','fitness_workouts',
    'fitness_exercises','fitness_progress_logs','fitness_body_metrics','fitness_prs',
    'notes','prompts','resources','daily_logs','tags','attachments','integrations'
  ])
  loop
    execute format(
      'create policy %I_anon_select_single on %I for select to anon using (user_id::text = %L)',
      t, t, fixed_user
    );

    execute format(
      'create policy %I_anon_insert_single on %I for insert to anon with check (user_id::text = %L)',
      t, t, fixed_user
    );

    execute format(
      'create policy %I_anon_update_single on %I for update to anon using (user_id::text = %L) with check (user_id::text = %L)',
      t, t, fixed_user, fixed_user
    );

    execute format(
      'create policy %I_anon_delete_single on %I for delete to anon using (user_id::text = %L)',
      t, t, fixed_user
    );
  end loop;
end $$;

-- 5) Seed opcional mínimo para probar conexión
insert into projects (id, user_id, title, description, status, priority)
values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'ebnjaOS Core',
  'Proyecto base para validar sync',
  'active',
  'medium'
)
on conflict do nothing;
