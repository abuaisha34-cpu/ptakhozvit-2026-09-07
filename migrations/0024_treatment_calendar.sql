create table if not exists org_treatment_calendars (
  org_id integer primary key,
  payload jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists flock_treatment_calendars (
  flock_id integer primary key,
  payload jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  updated_by text
);
