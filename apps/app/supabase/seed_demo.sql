-- Nordly demo data seed
-- Safe to run multiple times.
--
-- IMPORTANT:
-- 1) This seed only targets known demo companies and demo emails.
-- 2) It does not modify non-demo tenants.
-- 3) Auth users are resolved by email from auth.users.
--
-- Demo auth users expected:
-- - demo-retail@nordly.app (Anna Retail Demo)
-- - demo-hotel@nordly.app (Erik Hotel Demo)
-- - demo-office@nordly.app (Sofia Office Demo)
-- - demo-admin@nordly.app (Nordly Demo Admin)
--
-- If your project uses Supabase Auth only (no public.profiles table),
-- this seed still works. If a public.profiles table exists, this seed tries
-- to upsert matching profile rows using the resolved auth user IDs.

create extension if not exists pgcrypto;

create or replace function public.nordly_reset_demo_data()
returns void
language plpgsql
as $$
declare
  demo_company_ids uuid[];
  demo_user_ids uuid[];
begin
  select array_agg(id)
  into demo_company_ids
  from public.companies
  where name in (
    'Stockholm Retail Group',
    'Aurora Stay Stockholm',
    'NorthPeak Offices Stockholm'
  );

  select array_agg(id)
  into demo_user_ids
  from auth.users
  where email in (
    'demo-retail@nordly.app',
    'demo-hotel@nordly.app',
    'demo-office@nordly.app',
    'demo-admin@nordly.app'
  );

  if demo_company_ids is not null then
    if to_regclass('public.savings_records') is not null then
      delete from public.savings_records where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.missions') is not null then
      delete from public.missions where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.insights') is not null then
      delete from public.insights where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.ai_generations') is not null then
      delete from public.ai_generations where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.reports') is not null then
      delete from public.reports where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.equipment') is not null then
      delete from public.equipment where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.billing_records') is not null then
      delete from public.billing_records where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.locations') is not null then
      delete from public.locations where company_id = any(demo_company_ids);
    end if;

    if to_regclass('public.company_members') is not null then
      delete from public.company_members where company_id = any(demo_company_ids);
    end if;

    delete from public.companies where id = any(demo_company_ids);
  end if;

  if demo_user_ids is not null and to_regclass('public.company_members') is not null then
    delete from public.company_members where user_id = any(demo_user_ids);
  end if;

  if demo_user_ids is not null and to_regclass('public.profiles') is not null then
    begin
      delete from public.profiles where id = any(demo_user_ids);
    exception when others then
      raise notice 'Skipping profiles cleanup due to schema mismatch: %', sqlerrm;
    end;
  end if;
end;
$$;

create or replace function public.nordly_seed_demo_data()
returns void
language plpgsql
as $$
declare
  -- Users (resolved from auth.users by email)
  v_user_retail uuid;
  v_user_hotel uuid;
  v_user_office uuid;
  v_user_admin uuid;

  -- Company member role fallback logic
  v_role_typtype char;
  v_role_type_oid oid;
  v_member_role text := 'admin';
begin
  perform public.nordly_reset_demo_data();

  -- Resolve demo auth users.
  select id into v_user_retail from auth.users where email = 'demo-retail@nordly.app' limit 1;
  select id into v_user_hotel from auth.users where email = 'demo-hotel@nordly.app' limit 1;
  select id into v_user_office from auth.users where email = 'demo-office@nordly.app' limit 1;
  select id into v_user_admin from auth.users where email = 'demo-admin@nordly.app' limit 1;

  if v_user_retail is null then
    raise notice 'Missing auth user: demo-retail@nordly.app';
  end if;
  if v_user_hotel is null then
    raise notice 'Missing auth user: demo-hotel@nordly.app';
  end if;
  if v_user_office is null then
    raise notice 'Missing auth user: demo-office@nordly.app';
  end if;
  if v_user_admin is null then
    raise notice 'Missing auth user: demo-admin@nordly.app';
  end if;

  -- If company_members.role is enum and does not include admin, fallback to owner.
  select t.typtype, t.oid
  into v_role_typtype, v_role_type_oid
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  where n.nspname = 'public'
    and c.relname = 'company_members'
    and a.attname = 'role'
    and a.attnum > 0
    and not a.attisdropped
  limit 1;

  if v_role_typtype = 'e' then
    if exists (
      select 1 from pg_enum e where e.enumtypid = v_role_type_oid and e.enumlabel = 'admin'
    ) then
      v_member_role := 'admin';
    elsif exists (
      select 1 from pg_enum e where e.enumtypid = v_role_type_oid and e.enumlabel = 'owner'
    ) then
      v_member_role := 'owner';
    else
      select enumlabel into v_member_role
      from pg_enum
      where enumtypid = v_role_type_oid
      order by enumsortorder
      limit 1;
    end if;
  end if;

  -- 1) Companies (deterministic IDs)
  insert into public.companies (id, name, industry, country, subscription_tier, created_at, created_by)
  values
    ('10000000-0000-0000-0000-000000000001', 'Stockholm Retail Group', 'retail', 'Sweden', 'free',    '2026-01-10T08:20:00Z', coalesce(v_user_retail, v_user_admin)),
    ('10000000-0000-0000-0000-000000000002', 'Aurora Stay Stockholm',  'hospitality', 'Sweden', 'premium', '2026-01-12T09:10:00Z', coalesce(v_user_hotel, v_user_admin)),
    ('10000000-0000-0000-0000-000000000003', 'NorthPeak Offices Stockholm', 'office', 'Sweden', 'premium', '2026-01-15T10:00:00Z', coalesce(v_user_office, v_user_admin))
  on conflict (id) do update
  set name = excluded.name,
      industry = excluded.industry,
      country = excluded.country,
      subscription_tier = excluded.subscription_tier,
      created_at = excluded.created_at,
      created_by = excluded.created_by;

  -- 2) Optional profiles sync (if table exists)
  if to_regclass('public.profiles') is not null then
    begin
      if v_user_retail is not null then
        execute
          'insert into public.profiles (id, full_name) values ($1, $2)
           on conflict (id) do update set full_name = excluded.full_name'
        using v_user_retail, 'Anna Retail Demo';
      end if;

      if v_user_hotel is not null then
        execute
          'insert into public.profiles (id, full_name) values ($1, $2)
           on conflict (id) do update set full_name = excluded.full_name'
        using v_user_hotel, 'Erik Hotel Demo';
      end if;

      if v_user_office is not null then
        execute
          'insert into public.profiles (id, full_name) values ($1, $2)
           on conflict (id) do update set full_name = excluded.full_name'
        using v_user_office, 'Sofia Office Demo';
      end if;

      if v_user_admin is not null then
        execute
          'insert into public.profiles (id, full_name) values ($1, $2)
           on conflict (id) do update set full_name = excluded.full_name'
        using v_user_admin, 'Nordly Demo Admin';
      end if;
    exception when others then
      raise notice 'Skipping profiles upsert due to schema mismatch: %', sqlerrm;
    end;
  end if;

  -- 3) Company memberships
  if v_user_retail is not null then
    insert into public.company_members (company_id, user_id, role)
    values ('10000000-0000-0000-0000-000000000001', v_user_retail, v_member_role);
  end if;

  if v_user_hotel is not null then
    insert into public.company_members (company_id, user_id, role)
    values ('10000000-0000-0000-0000-000000000002', v_user_hotel, v_member_role);
  end if;

  if v_user_office is not null then
    insert into public.company_members (company_id, user_id, role)
    values ('10000000-0000-0000-0000-000000000003', v_user_office, v_member_role);
  end if;

  if v_user_admin is not null then
    insert into public.company_members (company_id, user_id, role)
    values
      ('10000000-0000-0000-0000-000000000001', v_user_admin, v_member_role),
      ('10000000-0000-0000-0000-000000000002', v_user_admin, v_member_role),
      ('10000000-0000-0000-0000-000000000003', v_user_admin, v_member_role);
  end if;

  -- 4) Stockholm locations (location_type always populated)
  insert into public.locations (
    id, company_id, name, location_type, city, country, floor_area_sqm,
    occupancy_notes, operating_hours_notes, created_at
  )
  values
    (
      '20000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      'Stockholm Retail Group - Norrmalm Store',
      'retail',
      'Stockholm',
      'Sweden',
      420,
      'Peak foot traffic around lunch and early evening, stronger flow on Saturdays.',
      'Open Mon-Sat 10:00-20:00, Sun 11:00-18:00',
      '2026-01-11T08:30:00Z'
    ),
    (
      '20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      'Stockholm Retail Group - Sodermalm Store',
      'retail',
      'Stockholm',
      'Sweden',
      360,
      'Steady daytime occupancy with short evening peaks during promotions.',
      'Open daily 10:00-19:00',
      '2026-01-11T08:40:00Z'
    ),
    (
      '20000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000002',
      'Aurora Stay Stockholm - Central Hotel',
      'hotel',
      'Stockholm',
      'Sweden',
      4800,
      'Business travelers during weekdays, higher leisure occupancy on weekends.',
      '24/7 operation',
      '2026-01-12T09:20:00Z'
    ),
    (
      '20000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000002',
      'Aurora Stay Stockholm - Waterfront Hotel',
      'hotel',
      'Stockholm',
      'Sweden',
      6200,
      'Steady annual occupancy with conference peaks.',
      '24/7 operation',
      '2026-01-12T09:40:00Z'
    ),
    (
      '20000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000003',
      'NorthPeak Offices Stockholm - HQ Kungsholmen',
      'office',
      'Stockholm',
      'Sweden',
      2100,
      'High occupancy Tue-Thu, lighter attendance on Mondays and Fridays.',
      'Office hours Mon-Fri 08:00-18:00',
      '2026-01-15T10:20:00Z'
    ),
    (
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000003',
      'NorthPeak Offices Stockholm - Office Solna',
      'office',
      'Stockholm',
      'Sweden',
      1450,
      'Hybrid schedule with concentrated occupancy in midweek collaboration days.',
      'Office hours Mon-Fri 08:00-17:30',
      '2026-01-15T10:40:00Z'
    )
  on conflict (id) do update
  set company_id = excluded.company_id,
      name = excluded.name,
      location_type = excluded.location_type,
      city = excluded.city,
      country = excluded.country,
      floor_area_sqm = excluded.floor_area_sqm,
      occupancy_notes = excluded.occupancy_notes,
      operating_hours_notes = excluded.operating_hours_notes,
      created_at = excluded.created_at;

  -- 5) AI generation logs
  insert into public.ai_generations (
    id, company_id, user_id, location_id, generation_type, input_payload_json,
    prompt_version, model_name, model, output_payload_json, prompt_summary,
    insight_count, status, created_at
  )
  values
    (
      '30000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      v_user_retail,
      '20000000-0000-0000-0000-000000000001',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'retail',
        'company_country', 'Sweden',
        'subscription_tier', 'free',
        'location_name', 'Stockholm Retail Group - Norrmalm Store',
        'location_type', 'retail',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 420,
        'operating_pattern', 'Mon-Sat daytime retail, Sunday reduced hours',
        'equipment_context', jsonb_build_array(),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1-mini',
      'gpt-4.1-mini',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Reduce after-hours HVAC runtime in Norrmalm Store',
        'Optimize winter entrance heating strategy',
        'Cut display and signage standby consumption'
      )),
      'Retail baseline pass with operating-hours and standby focus.',
      3,
      'completed',
      '2026-03-03T08:15:00Z'
    ),
    (
      '30000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      v_user_retail,
      '20000000-0000-0000-0000-000000000002',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'retail',
        'company_country', 'Sweden',
        'subscription_tier', 'free',
        'location_name', 'Stockholm Retail Group - Sodermalm Store',
        'location_type', 'retail',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 360,
        'operating_pattern', 'Daily daytime retail operation',
        'equipment_context', jsonb_build_array(),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1-mini',
      'gpt-4.1-mini',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Upgrade sales-floor lighting schedules in Sodermalm Store',
        'Align back-room ventilation with delivery windows',
        'Stabilize refrigeration case defrost schedule'
      )),
      'Retail daily-schedule pass with lighting and back-room optimization.',
      3,
      'completed',
      '2026-03-04T08:20:00Z'
    ),
    (
      '30000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000002',
      v_user_hotel,
      '20000000-0000-0000-0000-000000000003',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'hospitality',
        'company_country', 'Sweden',
        'subscription_tier', 'premium',
        'location_name', 'Aurora Stay Stockholm - Central Hotel',
        'location_type', 'hotel',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 4800,
        'operating_pattern', '24/7 mixed guest occupancy and conference activity',
        'equipment_context', jsonb_build_array('air handling unit', 'domestic hot water system', 'circulation pump'),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1',
      'gpt-4.1',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Optimize domestic hot water scheduling at Central Hotel',
        'Reduce corridor lighting waste during low-occupancy periods',
        'Improve boiler and circulation pump operating windows'
      )),
      'Hotel pass centered on occupancy-aware HVAC and hot-water scheduling.',
      3,
      'completed',
      '2026-03-05T07:55:00Z'
    ),
    (
      '30000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000002',
      v_user_hotel,
      '20000000-0000-0000-0000-000000000004',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'hospitality',
        'company_country', 'Sweden',
        'subscription_tier', 'premium',
        'location_name', 'Aurora Stay Stockholm - Waterfront Hotel',
        'location_type', 'hotel',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 6200,
        'operating_pattern', '24/7 operation with conference peaks',
        'equipment_context', jsonb_build_array('condensing boiler', 'laundry equipment', 'air handling unit'),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1',
      'gpt-4.1',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Tune ventilation rates by occupancy at Waterfront Hotel',
        'Identify laundry and back-of-house schedule optimization opportunities',
        'Refine kitchen exhaust balancing during low occupancy windows'
      )),
      'Hotel premium pass with equipment-aware operating windows.',
      3,
      'completed',
      '2026-03-05T08:10:00Z'
    ),
    (
      '30000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000003',
      v_user_office,
      '20000000-0000-0000-0000-000000000005',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'office',
        'company_country', 'Sweden',
        'subscription_tier', 'premium',
        'location_name', 'NorthPeak Offices Stockholm - HQ Kungsholmen',
        'location_type', 'office',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 2100,
        'operating_pattern', 'Weekday office occupancy with lighter Friday attendance',
        'equipment_context', jsonb_build_array('rooftop HVAC unit', 'lighting control panels', 'server rack cooling unit'),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1',
      'gpt-4.1',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Reduce weekend standby loads at HQ Kungsholmen',
        'Reduce unnecessary lighting in shared zones after 18:00',
        'Improve IT/server room cooling control'
      )),
      'Office premium pass with occupancy and equipment-aware control suggestions.',
      3,
      'completed',
      '2026-03-06T08:05:00Z'
    ),
    (
      '30000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000003',
      v_user_office,
      '20000000-0000-0000-0000-000000000006',
      'insight_generation',
      jsonb_build_object(
        'company_industry', 'office',
        'company_country', 'Sweden',
        'subscription_tier', 'premium',
        'location_name', 'NorthPeak Offices Stockholm - Office Solna',
        'location_type', 'office',
        'city', 'Stockholm',
        'country', 'Sweden',
        'floor_area_sqm', 1450,
        'operating_pattern', 'Weekday office operation with hybrid occupancy swings',
        'equipment_context', jsonb_build_array('office ventilation unit', 'lighting control panels'),
        'currency', 'EUR'
      ),
      'insights-v3.2-stockholm',
      'gpt-4.1',
      'gpt-4.1',
      jsonb_build_object('generated_insight_titles', jsonb_build_array(
        'Align HVAC start/stop with actual occupancy at Office Solna',
        'Optimize meeting-room ventilation usage',
        'Cut early-morning base load before staff arrival'
      )),
      'Office hybrid-occupancy pass with schedule and ventilation focus.',
      3,
      'completed',
      '2026-03-06T08:25:00Z'
    )
  on conflict (id) do update
  set company_id = excluded.company_id,
      user_id = excluded.user_id,
      location_id = excluded.location_id,
      generation_type = excluded.generation_type,
      input_payload_json = excluded.input_payload_json,
      prompt_version = excluded.prompt_version,
      model_name = excluded.model_name,
      model = excluded.model,
      output_payload_json = excluded.output_payload_json,
      prompt_summary = excluded.prompt_summary,
      insight_count = excluded.insight_count,
      status = excluded.status,
      created_at = excluded.created_at;

  -- 6) Insights (18 total: 6 per company)
  insert into public.insights (
    id, company_id, location_id, source_type, title, summary, description_md,
    category, confidence_score, estimation_basis, estimated_savings_value,
    estimated_savings_percent, status, ai_generation_id, created_at
  )
  values
    (
      '40000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      'ai_generated',
      'Reduce after-hours HVAC runtime in Norrmalm Store',
      'Store HVAC appears likely to be operating beyond trading hours.',
      $$### Opportunity
HVAC runtime appears to continue into late evening after customer traffic drops.

### Why this matters
- Energy demand stays elevated during closed hours.
- Temperature pull-down can be delayed until pre-open without comfort impact.

### Recommended action
1. Shift weekday stop time 45-60 minutes earlier.
2. Keep a smaller overnight setback band for winter protection.
3. Review next 2 weeks of trend data and adjust by floor zone.$$,
      'hvac',
      0.82,
      '["Operating hours indicate long closed periods", "Floor area supports meaningful HVAC base load", "Pattern aligns with retail evening drift"]'::jsonb,
      320,
      9,
      'accepted',
      '30000000-0000-0000-0000-000000000001',
      '2026-03-03T08:20:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      'ai_generated',
      'Upgrade sales-floor lighting schedules in Sodermalm Store',
      'Lighting appears active earlier and later than required by store traffic.',
      $$### Opportunity
Sales-floor lighting can be tightened around opening and closing routines.

### Why this matters
- Daily overrun compounds into a stable monthly cost leak.
- Schedule cleanup has low operational risk.

### Recommended action
1. Stage lights by zone and occupancy pattern.
2. Introduce a 15-minute post-close sweep only for cleaning routes.
3. Validate lux levels at opening in the first week.$$,
      'lighting',
      0.76,
      '["Daily operating window is clearly defined", "Lighting category is controllable without hardware change", "Retail traffic peaks are concentrated"]'::jsonb,
      210,
      6,
      'in_progress',
      '30000000-0000-0000-0000-000000000002',
      '2026-03-04T08:35:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      'ai_generated',
      'Cut display and signage standby consumption',
      'Display and signage equipment likely remains energized overnight.',
      $$### Opportunity
Signage, digital displays, and small adapters can be sequenced to avoid overnight standby waste.

### Why this matters
- Standby loads are small individually but persistent.
- This is a fast payback operational change.

### Recommended action
1. Add timed shutdown for non-safety loads.
2. Assign opening checklist ownership.
3. Re-check baseline after one billing cycle.$$,
      'equipment',
      0.69,
      '["Retail stores often maintain non-critical standby loads", "No impact expected on customer comfort", "Savings estimate uses conservative standby hours"]'::jsonb,
      140,
      4,
      'completed',
      '30000000-0000-0000-0000-000000000001',
      '2026-03-07T09:05:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      'ai_generated',
      'Optimize winter entrance heating strategy',
      'Entrance heating is likely overcompensating during shoulder hours.',
      $$### Opportunity
Entrance heat output appears to remain high even when door traffic is moderate.

### Why this matters
- Front-zone heating is one of the fastest weather-sensitive cost drivers.
- Minor control changes can preserve comfort while reducing overshoot.

### Recommended action
1. Add weather-compensated setpoint offsets.
2. Align pre-heat to first customer arrival, not fixed early start.
3. Review comfort feedback after two cold weeks.$$,
      'operations',
      0.74,
      '["Store has clear opening and closing pattern", "Seasonal heating sensitivity in Stockholm climate", "Conservative reduction assumptions applied"]'::jsonb,
      260,
      7,
      'new',
      '30000000-0000-0000-0000-000000000001',
      '2026-03-08T07:50:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      'ai_generated',
      'Align back-room ventilation with delivery windows',
      'Back-room airflow appears higher than necessary outside loading activity.',
      $$### Opportunity
Back-room ventilation can likely be synchronized to delivery and sorting periods.

### Why this matters
- Ventilation fans add a stable base load during low activity windows.
- Scheduling can reduce runtime without compromising air quality.

### Recommended action
1. Link higher airflow mode to delivery schedule blocks.
2. Use lower baseline flow outside loading windows.
3. Validate with spot CO2 checks.$$,
      'schedule',
      0.67,
      '["Occupancy in back-room is intermittent", "Delivery windows create predictable demand peaks", "Estimate excludes major retrofit assumptions"]'::jsonb,
      175,
      5,
      'new',
      '30000000-0000-0000-0000-000000000002',
      '2026-03-08T08:05:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000001',
      null,
      'ai_generated',
      'Standardize close-down behavior across both retail sites',
      'Close-down routines differ across stores and create uneven night baselines.',
      $$### Opportunity
Observed behavior suggests each store follows a different shutdown sequence.

### Why this matters
- Inconsistent routines reduce predictability and increase recurring energy drift.
- A simple standard can improve repeatability.

### Recommended action
1. Publish one close-down checklist for both stores.
2. Add a weekly audit for standby and lighting status.
3. Track baseline change month over month.$$,
      'behavior',
      0.62,
      '["Cross-site behavior variance is common in multi-location retail", "Checklist enforcement has low implementation effort"]'::jsonb,
      190,
      5,
      'dismissed',
      '30000000-0000-0000-0000-000000000002',
      '2026-03-09T07:40:00Z'
    ),

    (
      '40000000-0000-0000-0000-000000000007',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      'ai_generated',
      'Optimize domestic hot water scheduling at Central Hotel',
      'Hot water recirculation appears high during predictable low-demand periods.',
      $$### Opportunity
Domestic hot water production appears to run at near-peak settings during low occupancy blocks.

### Why this matters
- Hot water generation is a major hotel energy driver.
- Occupancy-aware scheduling can reduce waste without guest discomfort.

### Recommended action
1. Introduce occupancy-linked recirculation temperature bands.
2. Shift recovery windows to pre-breakfast and late afternoon peaks.
3. Verify guest comfort and complaint rate weekly.$$,
      'hvac',
      0.86,
      '["24/7 hotel profile supports demand-based DHW controls", "Occupancy pattern includes predictable demand valleys", "Equipment context includes domestic hot water system"]'::jsonb,
      1180,
      11,
      'accepted',
      '30000000-0000-0000-0000-000000000003',
      '2026-03-05T08:05:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000008',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000004',
      'ai_generated',
      'Tune ventilation rates by occupancy at Waterfront Hotel',
      'Ventilation appears to maintain high flow during low room occupancy windows.',
      $$### Opportunity
Air handling setpoints can likely be better aligned with occupancy and conference calendars.

### Why this matters
- Ventilation overrun contributes meaningful fan and conditioning cost.
- Occupancy-driven control improves efficiency while preserving IAQ.

### Recommended action
1. Segment conference and guest-floor airflow schedules.
2. Add low-occupancy overnight setback with guardrails.
3. Track fan runtime and supply temperature shifts.$$,
      'hvac',
      0.88,
      '["Large floor area amplifies ventilation cost impact", "Conference peaks create variable demand", "Equipment context includes air handling units"]'::jsonb,
      1450,
      13,
      'in_progress',
      '30000000-0000-0000-0000-000000000004',
      '2026-03-05T08:30:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000009',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      'ai_generated',
      'Reduce corridor lighting waste during low-occupancy periods',
      'Night corridor lighting is likely over-illuminated for occupancy levels.',
      $$### Opportunity
Corridor lighting can be zoned with time and occupancy logic while maintaining safety standards.

### Why this matters
- Lighting runs continuously in hospitality environments.
- Smarter zoning delivers stable monthly savings.

### Recommended action
1. Apply late-night dimming profile by floor.
2. Keep minimum lux targets for safety compliance.
3. Monitor guest feedback and floor-level incident logs.$$,
      'lighting',
      0.79,
      '["24/7 corridors still have low-demand periods", "Safety levels can be preserved with staged dimming", "Estimate uses conservative dimming ratio"]'::jsonb,
      430,
      5,
      'new',
      '30000000-0000-0000-0000-000000000003',
      '2026-03-06T07:40:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000010',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      'ai_generated',
      'Improve boiler and circulation pump operating windows',
      'Boiler and pump operations seem broader than actual thermal demand windows.',
      $$### Opportunity
Boiler and circulation pump schedules can be narrowed around real demand peaks.

### Why this matters
- Pump and boiler synchronization directly impacts thermal efficiency.
- Better runtime windows reduce both fuel and electrical overhead.

### Recommended action
1. Align pump staging with DHW and heating demand blocks.
2. Reduce non-critical overnight circulation periods.
3. Re-baseline weekly against weather-normalized usage.$$,
      'equipment',
      0.84,
      '["Premium equipment context includes boiler and circulation assets", "Hotel load profile supports staged thermal operations", "Estimate avoids deep retrofit assumptions"]'::jsonb,
      970,
      8,
      'accepted',
      '30000000-0000-0000-0000-000000000003',
      '2026-03-06T08:10:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000011',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000004',
      'ai_generated',
      'Identify laundry and back-of-house schedule optimization opportunities',
      'Laundry and service processes are likely running outside optimal batch windows.',
      $$### Opportunity
Laundry and back-of-house demand can be concentrated to reduce overlapping energy peaks.

### Why this matters
- Service operations can materially lift demand charges and thermal load.
- Batch scheduling reduces simultaneous peak draw.

### Recommended action
1. Shift non-urgent laundry cycles to off-peak periods.
2. Coordinate kitchen prep and laundry windows to reduce overlap.
3. Track daily peak demand before and after adjustment.$$,
      'operations',
      0.77,
      '["Conference schedule creates predictable service spikes", "Back-of-house loads are operationally controllable", "Savings estimate based on peak overlap reduction"]'::jsonb,
      760,
      7,
      'new',
      '30000000-0000-0000-0000-000000000004',
      '2026-03-06T08:25:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000012',
      '10000000-0000-0000-0000-000000000002',
      null,
      'ai_generated',
      'Right-size overnight base load policy across both hotels',
      'Night base load differs by hotel and suggests uneven control strategy.',
      $$### Opportunity
Portfolio-level overnight policy can reduce variance and improve control consistency.

### Why this matters
- Consistent control standards improve repeatable savings.
- Site variance often indicates non-standard operation.

### Recommended action
1. Define shared overnight setpoint and equipment staging guardrails.
2. Compare each hotel against policy weekly.
3. Escalate persistent outliers to engineering review.$$,
      'behavior',
      0.66,
      '["Cross-hotel variance indicates controllable operational drift", "Standardized policy likely improves repeatability"]'::jsonb,
      690,
      6,
      'dismissed',
      '30000000-0000-0000-0000-000000000004',
      '2026-03-07T07:35:00Z'
    ),

    (
      '40000000-0000-0000-0000-000000000013',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000005',
      'ai_generated',
      'Reduce weekend standby loads at HQ Kungsholmen',
      'Weekend base load appears elevated compared with expected occupancy.',
      $$### Opportunity
Office systems and plug loads remain active through low-occupancy weekend periods.

### Why this matters
- Weekend standby drift accumulates into visible monthly cost.
- Load reduction is typically low effort and quick to validate.

### Recommended action
1. Introduce Friday evening shutdown routine for non-critical circuits.
2. Automate Monday pre-start for required systems.
3. Monitor weekend baseline over the next two cycles.$$,
      'behavior',
      0.81,
      '["Office occupancy is low on weekends", "Equipment list indicates controllable standby assets", "Estimate uses conservative baseline delta"]'::jsonb,
      410,
      8,
      'completed',
      '30000000-0000-0000-0000-000000000005',
      '2026-03-06T08:30:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000014',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006',
      'ai_generated',
      'Align HVAC start/stop with actual occupancy at Office Solna',
      'HVAC startup appears earlier than needed for hybrid occupancy patterns.',
      $$### Opportunity
Hybrid attendance allows tighter HVAC start and stop windows on low-density days.

### Why this matters
- Start-time drift creates avoidable morning demand and heating/cooling load.
- Occupancy-aware schedules preserve comfort while reducing runtime.

### Recommended action
1. Apply weekday profile splits (high occupancy vs low occupancy days).
2. Delay early-morning startup on low-density days.
3. Validate comfort metrics after first adjustment week.$$,
      'schedule',
      0.85,
      '["Hybrid occupancy pattern creates schedule opportunity", "Office ventilation and HVAC are controllable via BMS", "Savings estimate excludes deep retrofit costs"]'::jsonb,
      540,
      10,
      'accepted',
      '30000000-0000-0000-0000-000000000006',
      '2026-03-06T08:40:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000015',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006',
      'ai_generated',
      'Optimize meeting-room ventilation usage',
      'Ventilation in meeting areas appears to run beyond booking windows.',
      $$### Opportunity
Meeting-room ventilation can be tied more closely to booking and occupancy signals.

### Why this matters
- Meeting areas often have variable utilization.
- Runtime reduction can be achieved without sacrificing IAQ.

### Recommended action
1. Link ventilation boost mode to room booking windows.
2. Add short post-meeting purge rather than extended overrun.
3. Review CO2 spot checks for comfort assurance.$$,
      'hvac',
      0.72,
      '["Meeting room usage is intermittent", "Ventilation controls can be schedule-linked", "Estimate based on overrun reduction"]'::jsonb,
      260,
      5,
      'new',
      '30000000-0000-0000-0000-000000000006',
      '2026-03-07T07:45:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000016',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000005',
      'ai_generated',
      'Reduce unnecessary lighting in shared zones after 18:00',
      'Shared-area lighting remains high despite lower evening occupancy.',
      $$### Opportunity
Common-zone lighting levels can be reduced outside core occupancy windows.

### Why this matters
- Lighting in shared spaces has long daily runtime.
- Dimming and schedule cleanup provide immediate savings.

### Recommended action
1. Add after-18:00 dimming profile by zone.
2. Keep cleaning routes fully lit where needed.
3. Audit weekly for override drift.$$,
      'lighting',
      0.71,
      '["Evening occupancy drops in office profile", "Lighting controls panels available for scheduling", "Estimate based on measured runtime reduction assumptions"]'::jsonb,
      230,
      4,
      'accepted',
      '30000000-0000-0000-0000-000000000005',
      '2026-03-07T08:00:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000017',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000005',
      'ai_generated',
      'Improve IT/server room cooling control',
      'Server room cooling appears to run at conservative setpoints year-round.',
      $$### Opportunity
Cooling control bands can be tightened to avoid overcooling while maintaining IT resilience.

### Why this matters
- Continuous cooling is a stable office energy cost driver.
- Small setpoint and staging adjustments can yield consistent savings.

### Recommended action
1. Review current setpoint and deadband strategy.
2. Add staged operation for partial IT load periods.
3. Monitor alarms and thermal stability during rollout.$$,
      'equipment',
      0.83,
      '["Server rack cooling unit is present in equipment context", "Continuous operation creates strong savings leverage", "Estimate reflects conservative setpoint adjustment"]'::jsonb,
      620,
      9,
      'in_progress',
      '30000000-0000-0000-0000-000000000005',
      '2026-03-07T08:20:00Z'
    ),
    (
      '40000000-0000-0000-0000-000000000018',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006',
      'ai_generated',
      'Cut early-morning base load before staff arrival',
      'Early-morning demand is high relative to observed occupancy patterns.',
      $$### Opportunity
Non-essential circuits can remain in low-power mode until pre-arrival window.

### Why this matters
- Morning pre-load extends runtime with little operational value.
- This is a low-cost scheduling and behavior adjustment.

### Recommended action
1. Delay non-critical startup blocks by 30-45 minutes.
2. Keep only essential systems active before first arrivals.
3. Measure baseline change over 14 days.$$,
      'operations',
      0.68,
      '["Hybrid occupancy indicates delayed peak arrival", "Morning demand profile suggests avoidable pre-load", "Estimate uses conservative runtime shift"]'::jsonb,
      280,
      6,
      'new',
      '30000000-0000-0000-0000-000000000006',
      '2026-03-08T07:30:00Z'
    )
  on conflict (id) do update
  set company_id = excluded.company_id,
      location_id = excluded.location_id,
      source_type = excluded.source_type,
      title = excluded.title,
      summary = excluded.summary,
      description_md = excluded.description_md,
      category = excluded.category,
      confidence_score = excluded.confidence_score,
      estimation_basis = excluded.estimation_basis,
      estimated_savings_value = excluded.estimated_savings_value,
      estimated_savings_percent = excluded.estimated_savings_percent,
      status = excluded.status,
      ai_generation_id = excluded.ai_generation_id,
      created_at = excluded.created_at;

  -- 7) Missions from accepted/completed insights (9 total = 50%)
  insert into public.missions (
    id, company_id, location_id, source_insight_id, title, description_md,
    status, expected_savings_value, actual_savings_value, due_date, owner, created_at
  )
  values
    (
      '50000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'HVAC scheduling review - Norrmalm Store',
      'Review and tighten after-hours HVAC stop times for Norrmalm Store using a two-week comfort-safe rollout.',
      'open',
      320,
      null,
      '2026-04-15T00:00:00Z',
      'Anna Retail Demo',
      '2026-03-10T08:00:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000002',
      'Lighting schedule tuning - Sodermalm Store',
      'Implement staged opening/closing lighting schedule and verify evening sweep routines.',
      'in_progress',
      210,
      null,
      '2026-04-10T00:00:00Z',
      'Anna Retail Demo',
      '2026-03-11T08:30:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000003',
      'Standby shutdown policy for displays and signage',
      'Finalize and enforce overnight shutdown checklist for display screens and signage controllers.',
      'completed',
      140,
      150,
      '2026-03-25T00:00:00Z',
      'Anna Retail Demo',
      '2026-03-09T09:10:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      '40000000-0000-0000-0000-000000000007',
      'Domestic hot water schedule optimization - Central Hotel',
      'Tune recirculation windows and setpoint bands to occupancy profile while maintaining guest comfort.',
      'completed',
      1180,
      1120,
      '2026-03-30T00:00:00Z',
      'Erik Hotel Demo',
      '2026-03-10T07:45:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000004',
      '40000000-0000-0000-0000-000000000008',
      'Occupancy-linked ventilation rollout - Waterfront Hotel',
      'Deploy conference-aware ventilation schedules and monitor fan runtime and comfort metrics.',
      'in_progress',
      1450,
      null,
      '2026-04-20T00:00:00Z',
      'Erik Hotel Demo',
      '2026-03-11T07:50:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      '40000000-0000-0000-0000-000000000010',
      'Boiler and pump window optimization',
      'Adjust boiler and circulation pump staging based on measured demand windows and weather pattern.',
      'open',
      970,
      null,
      '2026-04-22T00:00:00Z',
      'Erik Hotel Demo',
      '2026-03-12T08:10:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000007',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000005',
      '40000000-0000-0000-0000-000000000013',
      'Weekend standby reduction - HQ Kungsholmen',
      'Enforce Friday shutdown and Monday pre-start policy for non-critical office loads.',
      'completed',
      410,
      395,
      '2026-03-28T00:00:00Z',
      'Sofia Office Demo',
      '2026-03-10T09:00:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000008',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006',
      '40000000-0000-0000-0000-000000000014',
      'HVAC occupancy alignment - Office Solna',
      'Apply high/low occupancy day schedules and monitor comfort outcomes after rollout.',
      'in_progress',
      540,
      null,
      '2026-04-18T00:00:00Z',
      'Sofia Office Demo',
      '2026-03-12T09:20:00Z'
    ),
    (
      '50000000-0000-0000-0000-000000000009',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000005',
      '40000000-0000-0000-0000-000000000016',
      'Shared-zone evening lighting optimization',
      'Deploy after-18:00 dimming profile and weekly override checks for common office zones.',
      'open',
      230,
      null,
      '2026-04-16T00:00:00Z',
      'Sofia Office Demo',
      '2026-03-12T09:40:00Z'
    )
  on conflict (id) do update
  set company_id = excluded.company_id,
      location_id = excluded.location_id,
      source_insight_id = excluded.source_insight_id,
      title = excluded.title,
      description_md = excluded.description_md,
      status = excluded.status,
      expected_savings_value = excluded.expected_savings_value,
      actual_savings_value = excluded.actual_savings_value,
      due_date = excluded.due_date,
      owner = excluded.owner,
      created_at = excluded.created_at;

  -- completed_at is optional across environments.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'missions'
      and column_name = 'completed_at'
  ) then
    update public.missions
    set completed_at = case id
      when '50000000-0000-0000-0000-000000000003' then '2026-03-24T16:20:00Z'::timestamptz
      when '50000000-0000-0000-0000-000000000004' then '2026-03-29T12:10:00Z'::timestamptz
      when '50000000-0000-0000-0000-000000000007' then '2026-03-27T17:05:00Z'::timestamptz
      else null
    end
    where id in (
      '50000000-0000-0000-0000-000000000003',
      '50000000-0000-0000-0000-000000000004',
      '50000000-0000-0000-0000-000000000007'
    );
  end if;

  -- 8) Savings records (estimated + measured)
  if to_regclass('public.savings_records') is not null then
    insert into public.savings_records (
      id, company_id, location_id, mission_id, insight_id,
      savings_type, amount_value, methodology, period_start, period_end,
      notes, created_at
    )
    values
      (
        '60000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        'estimated',
        320,
        'AI estimate based on operating schedule and location type',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Estimated monthly impact before schedule rollout.',
        '2026-04-01T08:00:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        '50000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000002',
        'estimated',
        210,
        'AI estimate based on operating schedule and location type',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Lighting schedule changes in progress.',
        '2026-04-02T08:20:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000002',
        '50000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000003',
        'measured',
        150,
        'Measured post-implementation comparison against prior 30-day baseline',
        '2026-03-01T00:00:00Z',
        '2026-03-31T23:59:59Z',
        'Measured result after signage standby shutdown enforcement.',
        '2026-04-01T09:30:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000003',
        '50000000-0000-0000-0000-000000000004',
        '40000000-0000-0000-0000-000000000007',
        'measured',
        1120,
        'Measured post-implementation comparison against prior 30-day baseline',
        '2026-03-01T00:00:00Z',
        '2026-03-31T23:59:59Z',
        'Measured savings from domestic hot water schedule improvements.',
        '2026-04-01T10:10:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000004',
        '50000000-0000-0000-0000-000000000005',
        '40000000-0000-0000-0000-000000000008',
        'estimated',
        1450,
        'AI estimate based on occupancy profile and location type',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Conference-driven ventilation schedule optimization in progress.',
        '2026-04-02T07:50:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000003',
        '50000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000010',
        'estimated',
        970,
        'AI estimate based on equipment operating window optimization',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Boiler and pump operating window changes not yet completed.',
        '2026-04-02T08:10:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000007',
        '10000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000005',
        '50000000-0000-0000-0000-000000000007',
        '40000000-0000-0000-0000-000000000013',
        'measured',
        395,
        'Measured post-implementation comparison against prior 30-day baseline',
        '2026-03-01T00:00:00Z',
        '2026-03-31T23:59:59Z',
        'Measured savings from weekend standby shutdown policy.',
        '2026-04-01T11:05:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000008',
        '10000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000006',
        '50000000-0000-0000-0000-000000000008',
        '40000000-0000-0000-0000-000000000014',
        'estimated',
        540,
        'AI estimate based on occupancy schedule alignment and location type',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'HVAC occupancy alignment mission in progress.',
        '2026-04-02T09:00:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000009',
        '10000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000005',
        '50000000-0000-0000-0000-000000000009',
        '40000000-0000-0000-0000-000000000016',
        'estimated',
        230,
        'AI estimate based on after-hours lighting profile optimization',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Shared-zone lighting mission is open.',
        '2026-04-02T09:20:00Z'
      ),
      (
        '60000000-0000-0000-0000-000000000010',
        '10000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000005',
        null,
        '40000000-0000-0000-0000-000000000017',
        'estimated',
        620,
        'AI estimate based on server room cooling control review',
        '2026-04-01T00:00:00Z',
        '2026-04-30T23:59:59Z',
        'Pipeline estimate not yet converted into a mission.',
        '2026-04-03T07:40:00Z'
      )
    on conflict (id) do update
    set company_id = excluded.company_id,
        location_id = excluded.location_id,
        mission_id = excluded.mission_id,
        insight_id = excluded.insight_id,
        savings_type = excluded.savings_type,
        amount_value = excluded.amount_value,
        methodology = excluded.methodology,
        period_start = excluded.period_start,
        period_end = excluded.period_end,
        notes = excluded.notes,
        created_at = excluded.created_at;
  end if;

  -- 9) Premium equipment only (hotel + office)
  if to_regclass('public.equipment') is not null then
    begin
      insert into public.equipment (
        id, company_id, location_id, category, name,
        manufacturer, model, quantity, notes, created_at
      )
      values
        ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'hvac', 'HVAC Air Handling Unit', 'Systemair', 'Geniox Core 24', 2, 'Primary guest-floor ventilation units.', '2026-02-10T08:00:00Z'),
        ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'heating', 'Condensing Boiler', 'Viessmann', 'Vitocrossal 300', 1, 'Supports domestic hot water and winter heating.', '2026-02-10T08:05:00Z'),
        ('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'domestic_hot_water', 'Domestic Hot Water System', 'NIBE', 'DHW Loop Pro', 1, 'Recirculation and storage control bundle.', '2026-02-10T08:10:00Z'),
        ('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'pump', 'Circulation Pump', 'Grundfos', 'MAGNA3', 3, 'Main hot-water and heating circulation pumps.', '2026-02-10T08:15:00Z'),
        ('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'operations', 'Laundry Equipment', 'Electrolux Professional', 'Line 6000', 6, 'Washer and dryer assets for back-of-house operations.', '2026-02-10T08:20:00Z'),

        ('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'hvac', 'Rooftop HVAC Unit', 'Swegon', 'GOLD RX 40', 2, 'Main rooftop units serving open office floors.', '2026-02-11T09:00:00Z'),
        ('70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'lighting', 'Lighting Control Panels', 'Schneider Electric', 'EcoStruxure LC', 4, 'Zonal control for shared office and corridor lighting.', '2026-02-11T09:05:00Z'),
        ('70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'cooling', 'Server Rack Cooling Unit', 'Vertiv', 'Liebert SRC', 2, 'Dedicated cooling for IT/server room.', '2026-02-11T09:10:00Z'),
        ('70000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 'ventilation', 'Office Ventilation Unit', 'FlaktGroup', 'eQ Prime', 2, 'Ventilation units for hybrid office floor zones.', '2026-02-11T09:15:00Z')
      on conflict (id) do update
      set company_id = excluded.company_id,
          location_id = excluded.location_id,
          category = excluded.category,
          name = excluded.name,
          manufacturer = excluded.manufacturer,
          model = excluded.model,
          quantity = excluded.quantity,
          notes = excluded.notes,
          created_at = excluded.created_at;
    exception when others then
      raise notice 'Skipping equipment seed due to schema mismatch: %', sqlerrm;
    end;
  end if;

  -- 10) Optional billing records (only if table exists and accepts these columns)
  if to_regclass('public.billing_records') is not null then
    begin
      insert into public.billing_records (
        id, company_id, location_id, billing_period_start, billing_period_end,
        energy_kwh, energy_cost, currency_code, source_type, created_at
      )
      values
        ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '2026-01-01', '2026-01-31', 18800, 4620, 'SEK', 'pdf', '2026-02-02T08:00:00Z'),
        ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '2026-02-01', '2026-02-28', 17950, 4380, 'SEK', 'pdf', '2026-03-02T08:00:00Z'),
        ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '2026-02-01', '2026-02-28', 24600, 5980, 'SEK', 'api', '2026-03-02T08:10:00Z'),
        ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '2026-01-01', '2026-01-31', 12100, 2890, 'SEK', 'csv', '2026-02-02T08:20:00Z'),
        ('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', '2026-02-01', '2026-02-28', 11650, 2740, 'SEK', 'csv', '2026-03-02T08:20:00Z'),
        ('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '2026-02-01', '2026-02-28', 9800, 2310, 'SEK', 'manual', '2026-03-02T08:30:00Z')
      on conflict (id) do update
      set company_id = excluded.company_id,
          location_id = excluded.location_id,
          billing_period_start = excluded.billing_period_start,
          billing_period_end = excluded.billing_period_end,
          energy_kwh = excluded.energy_kwh,
          energy_cost = excluded.energy_cost,
          currency_code = excluded.currency_code,
          source_type = excluded.source_type,
          created_at = excluded.created_at;
    exception when others then
      raise notice 'Skipping billing_records seed due to schema mismatch: %', sqlerrm;
    end;
  end if;

  raise notice 'Nordly demo data seeded successfully.';
end;
$$;

-- Usage from SQL editor:
-- select public.nordly_seed_demo_data();
--
-- Reset only:
-- select public.nordly_reset_demo_data();
