alter table organizations add column if not exists sheets_token text;
create unique index if not exists organizations_sheets_token_idx
  on organizations (sheets_token);
