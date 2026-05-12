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
  id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', status text not null check (status in ('active','paused','completed','archived')), priority text not null check (priority in ('low','medium','high','critical')), start_date date, due_date date, tags text[] default '{}', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', status text not null check (status in ('inbox','today','next','waiting','done','archived')), priority text not null check (priority in ('low','medium','high','critical')), due_date timestamptz, project_id uuid references projects(id) on delete set null, calendar_event_id uuid, tags text[] default '{}', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', start_time timestamptz not null, end_time timestamptz not null, location text default '', source text not null default 'internal', google_event_id text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists fitness_plans (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fitness_workouts (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, date date not null, type text not null check(type in ('strength','crossfit','cardio','mobility','recovery')), duration_minutes int not null default 0, intensity int not null default 5, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fitness_exercises (id uuid primary key default gen_random_uuid(), user_id uuid not null, workout_id uuid not null references fitness_workouts(id) on delete cascade, name text not null, sets int, reps int, weight numeric, rest int, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fitness_progress_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null, date date not null, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fitness_body_metrics (id uuid primary key default gen_random_uuid(), user_id uuid not null, date date not null, body_weight numeric, body_fat numeric, sleep_hours numeric, energy_level int, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists fitness_prs (id uuid primary key default gen_random_uuid(), user_id uuid not null, movement text not null, value numeric not null, unit text not null, date date not null, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists notes (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, content text not null, type text not null check(type in ('quick','idea','meeting','learning','reflection')), tags text[] default '{}', pinned boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists prompts (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', content text not null, category text not null, tags text[] default '{}', favorite boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists resources (id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, description text default '', url text, type text not null check(type in ('link','document','video','article','tool','reference')), tags text[] default '{}', source text default 'manual', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists daily_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null, date date not null, focus text default '', wins text default '', pending text default '', energy_level int, workout_done boolean default false, notes text default '', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists tags (id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, color text default '#6B7280', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists attachments (id uuid primary key default gen_random_uuid(), user_id uuid not null, entity_type text not null, entity_id uuid not null, file_path text not null, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists integrations (id uuid primary key default gen_random_uuid(), user_id uuid not null, provider text not null, status text not null default 'disconnected', config jsonb default '{}', created_at timestamptz default now(), updated_at timestamptz default now());

alter table tasks add constraint tasks_calendar_fk foreign key (calendar_event_id) references calendar_events(id) on delete set null;

alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table fitness_plans enable row level security;
alter table fitness_workouts enable row level security;
alter table fitness_exercises enable row level security;
alter table fitness_progress_logs enable row level security;
alter table fitness_body_metrics enable row level security;
alter table fitness_prs enable row level security;
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
  for t in select unnest(array['profiles','projects','tasks','calendar_events','fitness_plans','fitness_workouts','fitness_exercises','fitness_progress_logs','fitness_body_metrics','fitness_prs','notes','prompts','resources','daily_logs','tags','attachments','integrations'])
  loop
    execute format('drop policy if exists %I_select_own on %I', t, t);
    execute format('create policy %I_select_own on %I for select using (auth.uid() = user_id)', t, t);
    execute format('drop policy if exists %I_mod_own on %I', t, t);
    execute format('create policy %I_mod_own on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t, t);
    execute format('drop trigger if exists %I_updated on %I', t, t);
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;
