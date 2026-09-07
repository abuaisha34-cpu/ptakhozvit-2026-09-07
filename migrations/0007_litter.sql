-- Daily house walk: droppings appearance + litter condition.
-- Values are option ids from src/lib/broiler/litter.ts.

alter table daily_reports add column if not exists dropping_look text;
alter table daily_reports add column if not exists litter_state text;
