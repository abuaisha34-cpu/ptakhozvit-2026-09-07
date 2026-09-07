-- Multi-tenant holdings: one published app, isolated companies.

create table if not exists organizations (
  id          serial primary key,
  name        text not null,
  invite_code text not null unique,
  created_at  timestamptz not null default now(),
  created_by  text not null
);

create index if not exists organizations_invite_idx on organizations (invite_code);

alter table staff_profiles add column if not exists org_id integer references organizations(id) on delete set null;
create index if not exists staff_profiles_org_idx on staff_profiles (org_id);

alter table sites add column if not exists org_id integer references organizations(id) on delete cascade;
create index if not exists sites_org_idx on sites (org_id, sort_order);

alter table sites drop constraint if exists sites_code_key;
create unique index if not exists sites_org_code_uidx on sites (org_id, code) where org_id is not null;

alter table cost_settings add column if not exists org_id integer references organizations(id) on delete cascade;
create unique index if not exists cost_settings_org_uidx on cost_settings (org_id) where org_id is not null;
