alter table houses add column if not exists area_m2 numeric not null default 0;

update houses
   set area_m2 = round(capacity / 18.0)
 where coalesce(area_m2, 0) = 0
   and capacity > 0;
