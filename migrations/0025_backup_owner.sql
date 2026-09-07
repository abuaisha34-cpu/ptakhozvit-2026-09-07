-- Second platform owner is allowed. The old unique index is dropped in app
-- code (not here): DROP INDEX inside a pooled Neon transaction can 500 the
-- whole site. This file only records that the feature shipped.
select 1;
