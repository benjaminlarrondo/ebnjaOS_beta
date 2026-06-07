create extension if not exists "pgcrypto";

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  status text not null check (status in ('active','paused','completed','archived')),
  priority text not null check (priority in ('low','medium','high','critical')),
  start_date date,
  due_date date,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text default '',
  source text not null default 'manual',
  google_event_id text,
  source_id text,
  source_repo text,
  source_url text,
  external_updated_at timestamptz,
  sync_status text default 'synced',
  event_type text default 'event',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  status text not null check (status in ('inbox','today','next','waiting','done','archived')),
  priority text not null check (priority in ('low','medium','high','critical')),
  due_date timestamptz,
  project_id uuid references projects(id) on delete set null,
  calendar_event_id uuid,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  date date not null,
  type text not null check(type in ('strength','crossfit','cardio','mobility','recovery')),
  duration_minutes int not null default 0,
  intensity int not null default 5,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  workout_id uuid not null references fitness_workouts(id) on delete cascade,
  name text not null,
  sets int,
  reps int,
  weight numeric,
  rest int,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  workout_day_id uuid,
  workout_name text not null,
  readiness numeric,
  planned_volume numeric not null default 0,
  actual_volume numeric not null default 0,
  status text not null default 'planned' check (status in ('planned','completed','deload','recovery')),
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  body_weight numeric,
  body_fat numeric,
  sleep_hours numeric,
  energy_level int,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_prs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  movement text not null,
  value numeric not null,
  unit text not null,
  date date not null,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text not null default '',
  active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_workout_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  program_id uuid not null,
  day_number int not null,
  name text not null,
  description text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists fitness_exercises
  add column if not exists workout_day_id uuid,
  add column if not exists exercise_name text,
  add column if not exists sets int,
  add column if not exists reps int,
  add column if not exists target_weight numeric,
  add column if not exists rest_seconds int,
  add column if not exists sort_order int not null default 0;

update fitness_exercises
set
  workout_day_id = coalesce(workout_day_id, null),
  exercise_name = coalesce(exercise_name, name),
  sets = coalesce(sets, 0),
  reps = coalesce(reps, 0),
  target_weight = coalesce(target_weight, weight),
  rest_seconds = coalesce(rest_seconds, rest),
  sort_order = coalesce(sort_order, 0)
where exercise_name is null
   or sets is null
   or reps is null
   or target_weight is null
   or rest_seconds is null;

create table if not exists fitness_session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  workout_day_id uuid not null,
  date date not null,
  duration numeric not null default 0,
  notes text not null default '',
  status text not null default 'active' check (status in ('active','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fitness_set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null,
  exercise_name text not null,
  set_number int not null,
  weight numeric not null default 0,
  reps int not null default 0,
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fitness_workout_days_program_fk'
      and conrelid = 'public.fitness_workout_days'::regclass
  ) then
    alter table public.fitness_workout_days
      add constraint fitness_workout_days_program_fk
      foreign key (program_id) references public.fitness_programs(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fitness_exercises_workout_day_fk'
      and conrelid = 'public.fitness_exercises'::regclass
  ) then
    alter table public.fitness_exercises
      add constraint fitness_exercises_workout_day_fk
      foreign key (workout_day_id) references public.fitness_workout_days(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fitness_session_logs_workout_day_fk'
      and conrelid = 'public.fitness_session_logs'::regclass
  ) then
    alter table public.fitness_session_logs
      add constraint fitness_session_logs_workout_day_fk
      foreign key (workout_day_id) references public.fitness_workout_days(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fitness_set_logs_session_fk'
      and conrelid = 'public.fitness_set_logs'::regclass
  ) then
    alter table public.fitness_set_logs
      add constraint fitness_set_logs_session_fk
      foreign key (session_id) references public.fitness_session_logs(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'fitness_progress_workout_day_fk'
      and conrelid = 'public.fitness_progress'::regclass
  ) then
    alter table public.fitness_progress
      add constraint fitness_progress_workout_day_fk
      foreign key (workout_day_id) references public.fitness_workout_days(id) on delete set null;
  end if;
end $$;

create index if not exists idx_fitness_programs_active on fitness_programs(user_id, active);
create index if not exists idx_fitness_workout_days_program_order on fitness_workout_days(program_id, day_number);
create index if not exists idx_fitness_exercises_day_sort on fitness_exercises(workout_day_id, sort_order);
create index if not exists idx_fitness_session_logs_user_date on fitness_session_logs(user_id, date);
create index if not exists idx_fitness_session_logs_day on fitness_session_logs(workout_day_id, date);
create index if not exists idx_fitness_set_logs_session_sort on fitness_set_logs(session_id, exercise_name, set_number);
create index if not exists idx_fitness_progress_user_date on fitness_progress(user_id, date);
create index if not exists idx_fitness_progress_workout_day on fitness_progress(workout_day_id, date);

create unique index if not exists fitness_workout_days_program_day_unique on fitness_workout_days(program_id, day_number);
create unique index if not exists fitness_exercises_day_sort_unique on fitness_exercises(workout_day_id, sort_order);
create unique index if not exists fitness_session_logs_user_day_date_unique on fitness_session_logs(user_id, workout_day_id, date);
create unique index if not exists fitness_set_logs_session_set_unique on fitness_set_logs(session_id, exercise_name, set_number);
create unique index if not exists fitness_progress_user_date_unique on fitness_progress(user_id, date, workout_day_id);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  content text not null,
  type text not null check(type in ('quick','idea','meeting','learning','reflection')),
  tags text[] default '{}',
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  content text not null,
  category text not null,
  tags text[] default '{}',
  favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text default '',
  url text,
  type text not null check(type in ('link','document','video','article','tool','reference')),
  tags text[] default '{}',
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  date date not null,
  focus text default '',
  wins text default '',
  pending text default '',
  energy_level int,
  workout_done boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text default '#6B7280',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  file_path text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  status text not null default 'disconnected',
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_calendar_fk'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_calendar_fk
      foreign key (calendar_event_id) references public.calendar_events(id) on delete set null;
  end if;
end $$;

create index if not exists idx_calendar_events_source_source_id on calendar_events(source, source_id);
create index if not exists idx_calendar_events_start_time on calendar_events(start_time);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table fitness_plans enable row level security;
alter table fitness_workouts enable row level security;
alter table fitness_exercises enable row level security;
alter table fitness_progress_logs enable row level security;
alter table fitness_progress enable row level security;
alter table fitness_body_metrics enable row level security;
alter table fitness_prs enable row level security;
alter table fitness_programs enable row level security;
alter table fitness_workout_days enable row level security;
alter table fitness_session_logs enable row level security;
alter table fitness_set_logs enable row level security;
alter table notes enable row level security;
alter table prompts enable row level security;
alter table resources enable row level security;
alter table daily_logs enable row level security;
alter table tags enable row level security;
alter table attachments enable row level security;
alter table integrations enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles','projects','tasks','calendar_events','fitness_plans','fitness_workouts',
    'fitness_exercises','fitness_progress_logs','fitness_progress','fitness_body_metrics','fitness_prs',
    'fitness_programs','fitness_workout_days','fitness_session_logs','fitness_set_logs',
    'notes','prompts','resources','daily_logs','tags','attachments','integrations'
  ])
  loop
    execute format('drop policy if exists %I_select_own on %I', t, t);
    execute format('create policy %I_select_own on %I for select using (auth.uid() = user_id)', t, t);
    execute format('drop policy if exists %I_mod_own on %I', t, t);
    execute format('create policy %I_mod_own on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format('drop trigger if exists %I_updated on %I', t, t);
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;
