-- Geographic location per factory so daily reports can pull outdoor weather.
alter table sites add column if not exists geo_name text;
alter table sites add column if not exists geo_admin text;
alter table sites add column if not exists lat double precision;
alter table sites add column if not exists lon double precision;
