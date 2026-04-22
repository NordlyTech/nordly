-- Migration: add estimation basis to insights
-- Purpose: store explainable basis points behind AI savings estimates.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'insights'
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'insights'
        and column_name = 'estimation_basis'
    ) then
      alter table public.insights
        add column estimation_basis jsonb;
    end if;
  end if;
end;
$$;
