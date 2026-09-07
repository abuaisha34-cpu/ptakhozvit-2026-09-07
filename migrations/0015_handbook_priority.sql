alter table handbook_articles
  add column if not exists priority boolean not null default false;
