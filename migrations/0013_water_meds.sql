create table if not exists daily_report_meds (
  id serial primary key,
  report_id integer not null references daily_reports(id) on delete cascade,
  prep_id text not null,
  group_id text not null,
  name text not null,
  conc numeric not null,
  unit text not null,
  sort_order integer not null default 0
);

create index if not exists daily_report_meds_report_idx
  on daily_report_meds (report_id, sort_order);
