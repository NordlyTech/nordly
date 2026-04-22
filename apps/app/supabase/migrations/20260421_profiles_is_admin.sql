-- Migration: add profiles.is_admin
-- Purpose: enable application-level admin route gating.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles'
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'is_admin'
    ) then
      alter table public.profiles
        add column is_admin boolean not null default false;
    end if;
  end if;
end;
$$;

create index if not exists profiles_is_admin_idx
  on public.profiles(is_admin);
