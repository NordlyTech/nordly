-- Migration: reports generation v1
-- Purpose: add report storage and bring ai_generations to the richer payload shape used by app features.

create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ai_generations'
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'user_id'
    ) then
      alter table public.ai_generations
        add column user_id uuid references auth.users(id) on delete set null;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'generation_type'
    ) then
      alter table public.ai_generations
        add column generation_type text not null default 'location_insights';
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'input_payload_json'
    ) then
      alter table public.ai_generations
        add column input_payload_json jsonb;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'output_payload_json'
    ) then
      alter table public.ai_generations
        add column output_payload_json jsonb;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'prompt_version'
    ) then
      alter table public.ai_generations
        add column prompt_version text;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'model_name'
    ) then
      alter table public.ai_generations
        add column model_name text;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'ai_generations'
        and column_name = 'model'
    ) then
      update public.ai_generations
      set model_name = coalesce(model_name, model)
      where model_name is null;
    end if;
  end if;
end;
$$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  ai_generation_id uuid references public.ai_generations(id) on delete set null,
  title text not null,
  summary_json jsonb not null,
  report_payload_json jsonb not null,
  estimated_monthly_savings_value numeric,
  estimated_yearly_savings_value numeric,
  overall_confidence_score numeric,
  status text not null default 'generated',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_company_id_created_at_idx
  on public.reports(company_id, created_at desc);

create index if not exists reports_location_id_idx
  on public.reports(location_id);

create index if not exists reports_ai_generation_id_idx
  on public.reports(ai_generation_id);

alter table public.reports enable row level security;

drop policy if exists "company members can manage reports" on public.reports;

create policy "company members can manage reports"
  on public.reports
  for all
  using (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = reports.company_id
        and cm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = reports.company_id
        and cm.user_id = auth.uid()
    )
  );

create or replace function public.set_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_reports_updated_at on public.reports;

create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_reports_updated_at();

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
        and column_name = 'report_id'
    ) then
      alter table public.insights
        add column report_id uuid references public.reports(id) on delete set null;
    end if;
  end if;
end;
$$;