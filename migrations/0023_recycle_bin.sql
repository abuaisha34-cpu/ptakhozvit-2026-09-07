-- Archive copies of deleted flocks/reports. Live tables are never altered,
-- so a missed migrate cannot 500 the dashboard.
create table if not exists recycle_flocks (
  id integer primary key,
  site_id integer not null,
  house_id integer not null,
  code text not null default '',
  breed text not null default '',
  placed_at date,
  chicks_placed integer,
  status text,
  payload jsonb not null,
  deleted_at timestamptz not null default now(),
  deleted_by text
);

create table if not exists recycle_reports (
  id integer primary key,
  flock_id integer not null,
  house_id integer,
  report_date date,
  payload jsonb not null,
  deleted_at timestamptz not null default now(),
  deleted_by text
);

create index if not exists recycle_flocks_site_idx on recycle_flocks (site_id, deleted_at desc);
create index if not exists recycle_reports_flock_idx on recycle_reports (flock_id);
