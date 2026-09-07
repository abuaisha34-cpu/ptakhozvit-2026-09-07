-- Poultry houses belong to factories (sites). Each house has its own flock / placement date.

create table if not exists houses (
  id          serial primary key,
  site_id     integer not null references sites(id) on delete cascade,
  code        text not null,
  name        text not null,
  capacity    integer not null default 11000,
  sort_order  integer not null default 0
);

create index if not exists houses_site_idx on houses (site_id, sort_order);

alter table flocks add column if not exists house_id integer references houses(id) on delete cascade;

create index if not exists flocks_house_status_idx on flocks (house_id, status);
