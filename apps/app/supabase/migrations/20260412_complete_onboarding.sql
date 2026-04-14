-- Migration: onboarding RPC bootstrap with SECURITY DEFINER
-- Purpose: Complete onboarding in one atomic operation while RLS remains enabled.

create or replace function public.complete_onboarding(
  p_company_name text,
  p_company_industry text,
  p_company_country text,
  p_location_name text,
  p_location_type text,
  p_location_country text,
  p_location_city text,
  p_location_address text default null,
  p_floor_area_sqm numeric default null,
  p_occupancy_notes text default null,
  p_operating_hours_notes text default null
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

  if coalesce(trim(p_company_country), '') = '' then
    raise exception 'company_country is required';
  end if;

  if coalesce(trim(p_location_name), '') = '' then
    raise exception 'location_name is required';
  end if;

  if coalesce(trim(p_location_country), '') = '' then
    raise exception 'location_country is required';
  end if;

  if coalesce(trim(p_location_city), '') = '' then
    raise exception 'location_city is required';
  end if;

  v_location_type := trim(coalesce(p_location_type, ''));

  if v_location_type = '' then
    raise exception 'location_type is required';
  end if;

  if v_location_type not in (
    'office',
    'hotel',
    'retail',
    'warehouse',
    'restaurant',
    'school',
    'healthcare',
    'industrial_light_use',
    'other'
  ) then
    raise exception 'invalid location_type';
  end if;

  if p_floor_area_sqm is not null and p_floor_area_sqm <= 0 then
    raise exception 'floor_area_sqm must be positive when provided';
  end if;

  if exists (
    select 1
    from public.company_members cm
    where cm.user_id = v_user_id
  ) then
    raise exception 'User is already onboarded';
  end if;

  insert into public.companies (name, industry, country, subscription_tier, created_by)
  values (trim(p_company_name), trim(p_company_industry), trim(p_company_country), 'free', v_user_id)
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, v_user_id, 'owner');

  insert into public.locations (
    company_id,
    name,
    location_type,
    country,
    city,
    address,
    floor_area_sqm,
    occupancy_notes,
    operating_hours_notes
  )
  values (
    v_company_id,
    trim(p_location_name),
    v_location_type::location_type_enum,
    trim(p_location_country),
    trim(p_location_city),
    nullif(trim(coalesce(p_location_address, '')), ''),
    p_floor_area_sqm,
    nullif(trim(coalesce(p_occupancy_notes, '')), ''),
    nullif(trim(coalesce(p_operating_hours_notes, '')), '')
  )
  returning id into v_location_id;

  return query select v_company_id, v_location_id;
end;
$$;

revoke all on function public.complete_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text
) from public;

grant execute on function public.complete_onboarding(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  text,
  text
) to authenticated;
