alter table organizations add column if not exists is_demo boolean not null default false;
alter table staff_profiles add column if not exists is_demo boolean not null default false;

create unique index if not exists organizations_one_demo_idx
  on organizations (is_demo)
  where is_demo = true;
