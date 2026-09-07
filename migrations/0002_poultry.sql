-- Operational schema for broiler daily reporting (5 sites, role-gated access).

create table if not exists sites (
  id          serial primary key,
  code        text not null unique,
  name        text not null,
  location    text not null default '',
  houses      integer not null default 2,
  capacity    integer not null default 22000,
  sort_order  integer not null default 0
);

create table if not exists flocks (
  id                serial primary key,
  site_id           integer not null references sites(id) on delete cascade,
  code              text not null,
  breed             text not null default 'Ross 308',
  placed_at         date not null,
  chicks_placed     integer not null,
  chick_cost_uah    numeric not null default 18,
  target_days       integer not null default 42,
  target_weight_g   integer not null default 2800,
  status            text not null default 'active',
  closed_at         date,
  slaughter_head    integer,
  slaughter_weight_g integer,
  created_at        timestamptz not null default now()
);

create index if not exists flocks_site_status_idx on flocks (site_id, status);

create table if not exists daily_reports (
  id            serial primary key,
  flock_id      integer not null references flocks(id) on delete cascade,
  report_date   date not null,
  age_days      integer not null,
  head_start    integer not null,
  mortality     integer not null default 0,
  culled        integer not null default 0,
  head_end      integer not null,
  avg_weight_g  integer not null default 0,
  feed_kg       numeric not null default 0,
  water_l       numeric,
  temp_min      numeric,
  temp_max      numeric,
  humidity_pct  numeric,
  notes         text not null default '',
  submitted_by  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (flock_id, report_date)
);

create index if not exists daily_reports_date_idx on daily_reports (report_date desc);
create index if not exists daily_reports_flock_idx on daily_reports (flock_id, report_date);

create table if not exists cost_settings (
  id                      integer primary key default 1,
  feed_price_uah          numeric not null default 14.50,
  chick_price_uah         numeric not null default 18.00,
  live_weight_price_uah   numeric not null default 62.00,
  other_per_bird_uah      numeric not null default 11.50,
  gas_per_bird_uah        numeric not null default 4.20,
  meds_per_bird_uah       numeric not null default 2.80,
  updated_at              timestamptz not null default now(),
  updated_by              text
);

insert into cost_settings (id) values (1) on conflict (id) do nothing;

create table if not exists staff_profiles (
  user_id     text primary key,
  role        text not null,
  site_id     integer references sites(id) on delete set null,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

create index if not exists staff_profiles_role_idx on staff_profiles (role);
