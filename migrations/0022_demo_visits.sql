create table if not exists demo_visits (
  id          serial primary key,
  user_id     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists demo_visits_created_idx on demo_visits (created_at desc);
create index if not exists demo_visits_user_idx on demo_visits (user_id);
