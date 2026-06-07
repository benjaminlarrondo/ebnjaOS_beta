begin;

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
  add column if not exists exercise_name text,
  add column if not exists sets int,
  add column if not exists reps int,
  add column if not exists target_weight numeric,
  add column if not exists rest_seconds int,
  add column if not exists sort_order int not null default 0;

update fitness_exercises
set
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

alter table if not exists fitness_exercises
  add column if not exists workout_day_id uuid;

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
end $$;

create index if not exists idx_fitness_programs_active on fitness_programs(user_id, active);
create index if not exists idx_fitness_workout_days_program_order on fitness_workout_days(program_id, day_number);
create index if not exists idx_fitness_exercises_day_sort on fitness_exercises(workout_day_id, sort_order);
create index if not exists idx_fitness_session_logs_user_date on fitness_session_logs(user_id, date);
create index if not exists idx_fitness_session_logs_day on fitness_session_logs(workout_day_id, date);
create index if not exists idx_fitness_set_logs_session_sort on fitness_set_logs(session_id, exercise_name, set_number);

alter table fitness_programs enable row level security;
alter table fitness_workout_days enable row level security;
alter table fitness_session_logs enable row level security;
alter table fitness_set_logs enable row level security;
alter table fitness_exercises enable row level security;

create unique index if not exists fitness_exercises_day_sort_unique on fitness_exercises(workout_day_id, sort_order);
create unique index if not exists fitness_workout_days_program_day_unique on fitness_workout_days(program_id, day_number);
create unique index if not exists fitness_session_logs_user_day_date_unique on fitness_session_logs(user_id, workout_day_id, date);
create unique index if not exists fitness_set_logs_session_set_unique on fitness_set_logs(session_id, exercise_name, set_number);

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'fitness_programs',
    'fitness_workout_days',
    'fitness_exercises',
    'fitness_session_logs',
    'fitness_set_logs'
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

commit;
