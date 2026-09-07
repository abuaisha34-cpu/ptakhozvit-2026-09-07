create table if not exists journal_events (
  id serial primary key,
  org_id integer not null references organizations(id) on delete cascade,
  site_id integer references sites(id) on delete set null,
  actor_user_id text not null,
  actor_name text not null,
  actor_role text,
  action text not null,
  entity text not null,
  summary text not null,
  href text,
  created_at timestamptz not null default now()
);

create index if not exists journal_org_created_idx
  on journal_events (org_id, created_at desc);

create index if not exists journal_site_created_idx
  on journal_events (site_id, created_at desc);
