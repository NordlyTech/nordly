-- Run this in Supabase SQL Editor for the Nordly onboarding flow.
-- This grants authenticated users permission to create and read their own
-- company, membership, and location records.

-- Ensure RLS is enabled.
alter table if exists public.companies enable row level security;
alter table if exists public.company_members enable row level security;
alter table if exists public.locations enable row level security;

-- Drop all existing policies on onboarding tables to avoid conflicts
-- with previously created permissive/restrictive policies.
do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('companies', 'company_members', 'locations')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end
$$;

-- companies policies
create policy companies_insert_owner
on public.companies
for insert
to authenticated
with check (created_by = auth.uid());

create policy companies_select_member
on public.companies
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = companies.id
      and cm.user_id = auth.uid()
  )
  or created_by = auth.uid()
);

create policy companies_update_owner
on public.companies
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- company_members policies
create policy company_members_insert_self
on public.company_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy company_members_select_self
on public.company_members
for select
to authenticated
using (user_id = auth.uid());

-- locations policies
create policy locations_insert_member
on public.locations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = locations.company_id
      and cm.user_id = auth.uid()
  )
);

create policy locations_select_member
on public.locations
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = locations.company_id
      and cm.user_id = auth.uid()
  )
);

create policy locations_update_member
on public.locations
for update
to authenticated
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = locations.company_id
      and cm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = locations.company_id
      and cm.user_id = auth.uid()
  )
);
