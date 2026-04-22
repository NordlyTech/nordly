-- Migration: Regionalization foundation (countries + currencies)
-- Purpose: Add canonical country/currency tables and backfill existing company/location context.

create extension if not exists pgcrypto;

create table if not exists public.currencies (
  code text primary key,
  name text not null,
  symbol text,
  minor_unit smallint not null default 2,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  code text primary key,
  name text not null,
  currency_code text not null references public.currencies(code),
  region text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.companies
  add column if not exists country_code text references public.countries(code),
  add column if not exists currency_code text references public.currencies(code);

alter table public.locations
  add column if not exists country_code text references public.countries(code);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'billing_records'
  ) then
    execute 'alter table public.billing_records add column if not exists currency_code text references public.currencies(code)';
  end if;
end $$;

insert into public.currencies (code, name, symbol, minor_unit, is_active)
values
  ('AED', 'UAE Dirham', 'AED', 2, true),
  ('CHF', 'Swiss Franc', 'CHF', 2, true),
  ('DKK', 'Danish Krone', 'kr', 2, true),
  ('EUR', 'Euro', 'EUR', 2, true),
  ('GBP', 'Pound Sterling', 'GBP', 2, true),
  ('NOK', 'Norwegian Krone', 'kr', 2, true),
  ('RSD', 'Serbian Dinar', 'RSD', 2, true),
  ('SEK', 'Swedish Krona', 'kr', 2, true),
  ('USD', 'US Dollar', '$', 2, true)
on conflict (code) do update
set
  name = excluded.name,
  symbol = excluded.symbol,
  minor_unit = excluded.minor_unit,
  is_active = excluded.is_active;

insert into public.countries (code, name, currency_code, region, is_active)
values
  ('AE', 'United Arab Emirates', 'AED', 'Middle East', true),
  ('CH', 'Switzerland', 'CHF', 'Europe', true),
  ('DE', 'Germany', 'EUR', 'Europe', true),
  ('DK', 'Denmark', 'DKK', 'Europe', true),
  ('ES', 'Spain', 'EUR', 'Europe', true),
  ('FR', 'France', 'EUR', 'Europe', true),
  ('GB', 'United Kingdom', 'GBP', 'Europe', true),
  ('IT', 'Italy', 'EUR', 'Europe', true),
  ('NL', 'Netherlands', 'EUR', 'Europe', true),
  ('NO', 'Norway', 'NOK', 'Europe', true),
  ('RS', 'Serbia', 'RSD', 'Europe', true),
  ('SE', 'Sweden', 'SEK', 'Europe', true),
  ('US', 'United States', 'USD', 'North America', true)
on conflict (code) do update
set
  name = excluded.name,
  currency_code = excluded.currency_code,
  region = excluded.region,
  is_active = excluded.is_active;

-- Backfill companies.country_code from existing free-text country where possible.
update public.companies c
set country_code = co.code
from public.countries co
where c.country_code is null
  and c.country is not null
  and (
    upper(trim(c.country)) = co.code
    or lower(trim(c.country)) = lower(co.name)
  );

-- Keep legacy country text populated from canonical lookup where missing.
update public.companies c
set country = co.name
from public.countries co
where c.country_code = co.code
  and (c.country is null or trim(c.country) = '');

-- Default company currency from country if missing.
update public.companies c
set currency_code = co.currency_code
from public.countries co
where c.currency_code is null
  and c.country_code = co.code;

-- Backfill locations.country_code from location free-text country.
update public.locations l
set country_code = co.code
from public.countries co
where l.country_code is null
  and l.country is not null
  and (
    upper(trim(l.country)) = co.code
    or lower(trim(l.country)) = lower(co.name)
  );

-- If still missing, default location country_code from company country_code.
update public.locations l
set country_code = c.country_code
from public.companies c
where l.company_id = c.id
  and l.country_code is null
  and c.country_code is not null;

-- Keep legacy location country text populated where missing.
update public.locations l
set country = co.name
from public.countries co
where l.country_code = co.code
  and (l.country is null or trim(l.country) = '');

-- Optional billing_records currency backfill if table exists.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'billing_records'
  ) then
    execute $sql$
      update public.billing_records br
      set currency_code = c.currency_code
      from public.companies c
      where br.company_id = c.id
        and br.currency_code is null
        and c.currency_code is not null
    $sql$;
  end if;
end $$;

-- Upgrade onboarding RPC to accept canonical country/currency codes.
drop function if exists public.complete_onboarding(
  text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
);

create or replace function public.complete_onboarding(
  p_company_name text,
  p_company_industry text,
  p_company_country_code text,
  p_company_currency_code text,
  p_location_name text,
  p_location_type text,
  p_location_country_code text,
  p_location_city text,
  p_location_address text default null,
  p_floor_area_sqm numeric default null,
  p_occupancy_notes text default null,
  p_operating_hours_notes text default null,
  p_monthly_energy_kwh numeric default null,
  p_monthly_energy_cost numeric default null
)
returns table(company_id uuid, location_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_company_id uuid;
  v_location_id uuid;
  v_location_type text;
  v_company_country_code text;
  v_company_currency_code text;
  v_location_country_code text;
  v_company_country_name text;
  v_location_country_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;

  if coalesce(trim(p_company_name), '') = '' then
    raise exception 'company_name is required';
  end if;

  if coalesce(trim(p_company_industry), '') = '' then
    raise exception 'company_industry is required';
  end if;

  if coalesce(trim(p_company_country_code), '') = '' then
    raise exception 'company_country_code is required';
  end if;

  if coalesce(trim(p_location_name), '') = '' then
    raise exception 'location_name is required';
  end if;

  if coalesce(trim(p_location_country_code), '') = '' then
    raise exception 'location_country_code is required';
  end if;

  if coalesce(trim(p_location_city), '') = '' then
    raise exception 'location_city is required';
  end if;

  v_location_type := trim(coalesce(p_location_type, ''));

  if v_location_type = '' then
    raise exception 'location_type is required';
  end if;

  if v_location_type not in (
    'office', 'hotel', 'retail', 'warehouse', 'restaurant',
    'school', 'healthcare', 'industrial_light_use', 'other'
  ) then
    raise exception 'invalid location_type';
  end if;

  if p_floor_area_sqm is not null and p_floor_area_sqm <= 0 then
    raise exception 'floor_area_sqm must be positive when provided';
  end if;

  if p_monthly_energy_kwh is not null and p_monthly_energy_kwh < 0 then
    raise exception 'monthly_energy_kwh must be zero or greater when provided';
  end if;

  if p_monthly_energy_cost is not null and p_monthly_energy_cost < 0 then
    raise exception 'monthly_energy_cost must be zero or greater when provided';
  end if;

  if exists (
    select 1
    from public.company_members cm
    where cm.user_id = v_user_id
  ) then
    raise exception 'User is already onboarded';
  end if;

  v_company_country_code := upper(trim(p_company_country_code));
  v_location_country_code := upper(trim(p_location_country_code));

  select c.name, c.currency_code
  into v_company_country_name, v_company_currency_code
  from public.countries c
  where c.code = v_company_country_code
    and c.is_active = true;

  if v_company_country_name is null then
    raise exception 'invalid company_country_code';
  end if;

  select c.name
  into v_location_country_name
  from public.countries c
  where c.code = v_location_country_code
    and c.is_active = true;

  if v_location_country_name is null then
    raise exception 'invalid location_country_code';
  end if;

  if coalesce(trim(p_company_currency_code), '') <> '' then
    v_company_currency_code := upper(trim(p_company_currency_code));

    if not exists (
      select 1
      from public.currencies cur
      where cur.code = v_company_currency_code
        and cur.is_active = true
    ) then
      raise exception 'invalid company_currency_code';
    end if;
  end if;

  insert into public.companies (
    name,
    industry,
    country,
    country_code,
    currency_code,
    subscription_tier,
    created_by
  )
  values (
    trim(p_company_name),
    trim(p_company_industry),
    v_company_country_name,
    v_company_country_code,
    v_company_currency_code,
    'free',
    v_user_id
  )
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, v_user_id, 'owner');

  insert into public.locations (
    company_id,
    name,
    location_type,
    country,
    country_code,
    city,
    address,
    floor_area_sqm,
    occupancy_notes,
    operating_hours_notes,
    monthly_energy_kwh,
    monthly_energy_cost
  )
  values (
    v_company_id,
    trim(p_location_name),
    v_location_type::location_type_enum,
    v_location_country_name,
    v_location_country_code,
    trim(p_location_city),
    nullif(trim(coalesce(p_location_address, '')), ''),
    p_floor_area_sqm,
    nullif(trim(coalesce(p_occupancy_notes, '')), ''),
    nullif(trim(coalesce(p_operating_hours_notes, '')), ''),
    p_monthly_energy_kwh,
    p_monthly_energy_cost
  )
  returning id into v_location_id;

  return query select v_company_id, v_location_id;
end;
$$;

revoke all on function public.complete_onboarding(
  text, text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
) from public;

grant execute on function public.complete_onboarding(
  text, text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
) to authenticated;
