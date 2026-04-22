-- Migration: savings_records table for automatic mission completion tracking
-- Purpose: Store estimated savings automatically created when missions are marked completed.

-- ─────────────────────────────────────────────
-- Create savings_records table (idempotent)
-- ─────────────────────────────────────────────
create table if not exists public.savings_records (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies(id)  on delete cascade,
  location_id      uuid        not null references public.locations(id) on delete cascade,
  mission_id       uuid                    references public.missions(id) on delete set null,
  insight_id       uuid                    references public.insights(id) on delete set null,
  savings_type     text        not null default 'estimated', -- 'estimated', 'measured'
  amount_value     numeric,
  methodology      text        not null, -- 'mission_completion_estimate', 'manual_input', 'iot_measured', etc.
  period_start     timestamptz,
  period_end       timestamptz,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.savings_records enable row level security;

-- RLS policy: company members can view/manage savings records for their company
create policy "company members can manage savings_records"
  on public.savings_records
  for all
  using (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = savings_records.company_id
        and cm.user_id = auth.uid()
    )
  );

-- Indexes for efficient querying
create index if not exists savings_records_company_id_idx on public.savings_records(company_id);
create index if not exists savings_records_location_id_idx on public.savings_records(location_id);
create index if not exists savings_records_mission_id_idx on public.savings_records(mission_id);
create index if not exists savings_records_insight_id_idx on public.savings_records(insight_id);
create index if not exists savings_records_methodology_idx on public.savings_records(methodology);
create index if not exists savings_records_created_at_idx on public.savings_records(created_at);
