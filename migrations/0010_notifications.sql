create table if not exists notifications (
  id serial primary key,
  org_id integer not null references organizations(id) on delete cascade,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  actor_user_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on notifications (user_id)
  where read_at is null;
