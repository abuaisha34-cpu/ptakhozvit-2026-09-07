-- One platform owner.
with keep as (
  select user_id
    from staff_profiles
   where is_owner = true
   order by created_at, user_id
   limit 1
)
update staff_profiles
   set is_owner = false
 where is_owner = true
   and user_id not in (select user_id from keep);

create unique index if not exists staff_profiles_one_owner_idx
  on staff_profiles (is_owner)
  where is_owner = true;

-- One active flock per house.
update flocks f
   set status = 'closed',
       closed_at = coalesce(f.closed_at, current_date)
 where f.status = 'active'
   and f.id not in (
     select kept.id
       from (
         select distinct on (house_id) id
           from flocks
          where status = 'active'
          order by house_id, placed_at desc, id desc
       ) kept
   );

create unique index if not exists flocks_one_active_per_house_idx
  on flocks (house_id)
  where status = 'active';
