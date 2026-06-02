-- Sprint 2.2C - Persistence Foundation tables

create table if not exists tracking_states (
  id text primary key,
  user_id uuid not null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists health_states (
  id text primary key,
  user_id uuid not null,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tracking_states_user_id on tracking_states(user_id);
create index if not exists idx_health_states_user_id on health_states(user_id);

alter table if exists tracking_states enable row level security;
alter table if exists health_states enable row level security;

drop policy if exists tracking_states_select_own on tracking_states;
create policy tracking_states_select_own on tracking_states
  for select using (auth.uid() = user_id);

drop policy if exists tracking_states_mod_own on tracking_states;
create policy tracking_states_mod_own on tracking_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists health_states_select_own on health_states;
create policy health_states_select_own on health_states
  for select using (auth.uid() = user_id);

drop policy if exists health_states_mod_own on health_states;
create policy health_states_mod_own on health_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional single-user anon policies (when using fixed user_id strategy)
drop policy if exists tracking_states_anon_select_single on tracking_states;
create policy tracking_states_anon_select_single on tracking_states
  for select to anon using (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists tracking_states_anon_insert_single on tracking_states;
create policy tracking_states_anon_insert_single on tracking_states
  for insert to anon with check (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists tracking_states_anon_update_single on tracking_states;
create policy tracking_states_anon_update_single on tracking_states
  for update to anon using (user_id::text = '00000000-0000-0000-0000-000000000001')
  with check (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists tracking_states_anon_delete_single on tracking_states;
create policy tracking_states_anon_delete_single on tracking_states
  for delete to anon using (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists health_states_anon_select_single on health_states;
create policy health_states_anon_select_single on health_states
  for select to anon using (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists health_states_anon_insert_single on health_states;
create policy health_states_anon_insert_single on health_states
  for insert to anon with check (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists health_states_anon_update_single on health_states;
create policy health_states_anon_update_single on health_states
  for update to anon using (user_id::text = '00000000-0000-0000-0000-000000000001')
  with check (user_id::text = '00000000-0000-0000-0000-000000000001');

drop policy if exists health_states_anon_delete_single on health_states;
create policy health_states_anon_delete_single on health_states
  for delete to anon using (user_id::text = '00000000-0000-0000-0000-000000000001');
