-- Migration: measured savings v1 (manual input)
-- Purpose: add nullable columns for user-reported actual savings on missions.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'missions'
      and column_name = 'actual_savings_value'
  ) then
    alter table public.missions
      add column actual_savings_value numeric;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'missions'
      and column_name = 'actual_savings_note'
  ) then
    alter table public.missions
      add column actual_savings_note text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'missions'
      and column_name = 'actual_savings_recorded_at'
  ) then
    alter table public.missions
      add column actual_savings_recorded_at timestamptz;
  end if;
end;
$$;
