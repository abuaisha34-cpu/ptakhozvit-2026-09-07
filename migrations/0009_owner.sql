-- Platform owner: first account can open every holding on this site.

alter table staff_profiles add column if not exists is_owner boolean not null default false;
create index if not exists staff_profiles_owner_idx on staff_profiles (is_owner);
