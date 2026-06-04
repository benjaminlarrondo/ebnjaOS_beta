-- =====================================================
-- ebnjaOS
-- Sprint 2.4D - Apple Health Metrics Persistence
-- =====================================================

begin;

-- =====================================================
-- FITNESS_BODY_METRICS
-- =====================================================

alter table fitness_body_metrics
add column if not exists steps_count integer default 0;

alter table fitness_body_metrics
add column if not exists hrv_ms numeric;

alter table fitness_body_metrics
add column if not exists resting_hr integer;

alter table fitness_body_metrics
add column if not exists source text default 'manual';

alter table fitness_body_metrics
add column if not exists external_id text;

alter table fitness_body_metrics
add column if not exists external_updated_at timestamptz;

alter table fitness_body_metrics
add column if not exists metadata jsonb default '{}'::jsonb;

-- =====================================================
-- FITNESS_WORKOUTS
-- =====================================================

alter table fitness_workouts
add column if not exists source text default 'manual';

alter table fitness_workouts
add column if not exists external_id text;

alter table fitness_workouts
add column if not exists external_updated_at timestamptz;

alter table fitness_workouts
add column if not exists metadata jsonb default '{}'::jsonb;

-- =====================================================
-- ÍNDICES
-- =====================================================

create index if not exists idx_fitness_body_metrics_user_date
on fitness_body_metrics(user_id, date);

create index if not exists idx_fitness_workouts_user_date
on fitness_workouts(user_id, date);

create index if not exists idx_fitness_body_metrics_external_id
on fitness_body_metrics(external_id);

create index if not exists idx_fitness_workouts_external_id
on fitness_workouts(external_id);

create unique index if not exists uidx_fitness_body_metrics_user_external_id
on fitness_body_metrics(user_id, external_id);

create unique index if not exists uidx_fitness_workouts_user_external_id
on fitness_workouts(user_id, external_id);

commit;
