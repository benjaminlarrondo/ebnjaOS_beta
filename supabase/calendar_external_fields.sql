-- Add external-source fields to calendar_events (safe migration)
alter table if exists calendar_events add column if not exists source_id text;
alter table if exists calendar_events add column if not exists source_repo text;
alter table if exists calendar_events add column if not exists source_url text;
alter table if exists calendar_events add column if not exists external_updated_at timestamptz;
alter table if exists calendar_events add column if not exists sync_status text default 'synced';
alter table if exists calendar_events add column if not exists event_type text default 'event';
alter table if exists calendar_events add column if not exists metadata jsonb default '{}'::jsonb;

alter table if exists calendar_events alter column source set default 'manual';

create index if not exists idx_calendar_events_source_source_id on calendar_events(source, source_id);
create index if not exists idx_calendar_events_start_time on calendar_events(start_time);
