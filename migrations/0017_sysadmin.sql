alter table staff_profiles add column if not exists is_admin boolean not null default false;
create index if not exists staff_profiles_admin_idx on staff_profiles (is_admin);
