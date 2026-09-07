-- Broiler sales on the daily report: head count + live weight from the scale.
-- Average bird and FCR at sale are derived, not stored.

alter table daily_reports add column if not exists sold_head integer not null default 0;
alter table daily_reports add column if not exists sold_weight_kg numeric not null default 0;
