do $$
begin
  if to_regclass('public.billing_records') is null then
    raise notice 'Skipping billing_records refinement because table does not exist.';
  else
    if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'period_start'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'billing_period_start'
    ) then
      execute 'alter table public.billing_records rename column period_start to billing_period_start';
    end if;

    if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'period_end'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'billing_period_end'
    ) then
      execute 'alter table public.billing_records rename column period_end to billing_period_end';
    end if;

    if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'amount_value'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'energy_cost'
    ) then
      execute 'alter table public.billing_records rename column amount_value to energy_cost';
    end if;

    execute 'alter table public.billing_records add column if not exists billing_period_start date';
    execute 'alter table public.billing_records add column if not exists billing_period_end date';
    execute 'alter table public.billing_records add column if not exists energy_kwh numeric';
    execute 'alter table public.billing_records add column if not exists energy_cost numeric';
    execute 'alter table public.billing_records add column if not exists source_type text';
    execute 'alter table public.billing_records add column if not exists currency_code text';

    if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'billing_records'
      and column_name = 'currency'
    ) then
      execute 'update public.billing_records set currency_code = coalesce(currency_code, upper(trim(currency))) where currency is not null';
      execute 'alter table public.billing_records drop column currency';
    end if;

    execute $sql$
      update public.billing_records
      set source_type = case
        when lower(trim(coalesce(source_type, ''))) in ('onboarding', 'manual', 'csv', 'pdf', 'api') then lower(trim(source_type))
        else 'manual'
      end
    $sql$;

    execute 'alter table public.billing_records alter column source_type set default ''manual''';
    execute 'alter table public.billing_records alter column source_type set not null';
  end if;
end
$$;

do $$
begin
  if to_regclass('public.billing_records') is not null then
    if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_records_energy_kwh_nonnegative'
      and conrelid = 'public.billing_records'::regclass
    ) then
      execute 'alter table public.billing_records add constraint billing_records_energy_kwh_nonnegative check (energy_kwh is null or energy_kwh >= 0)';
    end if;

    if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_records_energy_cost_nonnegative'
      and conrelid = 'public.billing_records'::regclass
    ) then
      execute 'alter table public.billing_records add constraint billing_records_energy_cost_nonnegative check (energy_cost is null or energy_cost >= 0)';
    end if;

    if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_records_period_order'
      and conrelid = 'public.billing_records'::regclass
    ) then
      execute 'alter table public.billing_records add constraint billing_records_period_order check (billing_period_start is null or billing_period_end is null or billing_period_end >= billing_period_start)';
    end if;

    if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_records_source_type_allowed'
      and conrelid = 'public.billing_records'::regclass
    ) then
      execute $constraint$alter table public.billing_records add constraint billing_records_source_type_allowed check (source_type in ('onboarding', 'manual', 'csv', 'pdf', 'api'))$constraint$;
    end if;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.billing_records') is not null then
    execute 'create index if not exists idx_billing_location on public.billing_records(location_id)';
    execute 'create index if not exists idx_billing_company on public.billing_records(company_id)';
    execute 'create index if not exists idx_billing_period on public.billing_records(billing_period_start, billing_period_end)';
  end if;
end
$$;

drop function if exists public.complete_onboarding(
  text, text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
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
  v_billing_period_start date;
  v_billing_period_end date;
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

  if (p_monthly_energy_kwh is not null or p_monthly_energy_cost is not null)
    and to_regclass('public.billing_records') is not null then
    v_billing_period_start := date_trunc('month', current_date)::date;
    v_billing_period_end := (date_trunc('month', current_date) + interval '1 month - 1 day')::date;

    insert into public.billing_records (
      company_id,
      location_id,
      billing_period_start,
      billing_period_end,
      energy_kwh,
      energy_cost,
      currency_code,
      source_type
    )
    values (
      v_company_id,
      v_location_id,
      v_billing_period_start,
      v_billing_period_end,
      p_monthly_energy_kwh,
      p_monthly_energy_cost,
      v_company_currency_code,
      'onboarding'
    );
  end if;

  return query select v_company_id, v_location_id;
end;
$$;

revoke all on function public.complete_onboarding(
  text, text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
) from public;

grant execute on function public.complete_onboarding(
  text, text, text, text, text, text, text, text, text, numeric, text, text, numeric, numeric
) to authenticated;