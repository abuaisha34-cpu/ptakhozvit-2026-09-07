create table if not exists org_norms (
  org_id integer primary key references organizations(id) on delete cascade,
  humidity_place_min numeric not null default 50,
  humidity_place_max numeric not null default 55,
  humidity_early_until integer not null default 14,
  humidity_early_min numeric not null default 50,
  humidity_early_max numeric not null default 60,
  humidity_late_min numeric not null default 50,
  humidity_late_max numeric not null default 70,
  density_limit_kg_m2 numeric not null default 42,
  density_warn_days integer not null default 5,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists handbook_articles (
  id serial primary key,
  org_id integer not null references organizations(id) on delete cascade,
  slug text not null,
  category text not null,
  question text not null,
  answer_tech text not null default '',
  answer_vet text not null default '',
  sort_order integer not null default 0,
  status text not null default 'published',
  hidden boolean not null default false,
  asked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

create index if not exists handbook_org_idx
  on handbook_articles (org_id, status, sort_order);
