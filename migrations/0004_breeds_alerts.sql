-- Breed-aware alerts: thresholds for feed / water / weight, one-time demo wipe flag.

alter table cost_settings add column if not exists feed_alert_pct numeric not null default 8;
alter table cost_settings add column if not exists water_alert_pct numeric not null default 10;
alter table cost_settings add column if not exists weight_alert_pct numeric not null default 6;
alter table cost_settings add column if not exists ops_reset integer not null default 0;
