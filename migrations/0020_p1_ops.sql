alter table daily_reports add column if not exists dropping_photo text;

create table if not exists join_attempts (
  id serial primary key,
  user_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists join_attempts_user_time_idx
  on join_attempts (user_id, created_at desc);
