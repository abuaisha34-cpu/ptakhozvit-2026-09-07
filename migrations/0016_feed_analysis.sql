create table if not exists feed_analyses (
  id serial primary key,
  org_id integer not null references organizations(id) on delete cascade,
  site_id integer references sites(id) on delete set null,
  phase text not null,
  name text not null default '',
  lab_date date,
  values_json text not null default '{}',
  score integer not null default 0,
  severity text not null default 'ok',
  headline text not null default '',
  submitted_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists feed_analyses_org_idx
  on feed_analyses (org_id, created_at desc);
