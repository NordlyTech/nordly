-- Migration: ai_generations table + insights ai_generation_id column
-- Purpose: Track AI generation runs and link insights back to their generation.

-- ─────────────────────────────────────────────
-- 1. ai_generations table
-- ─────────────────────────────────────────────
create table if not exists public.ai_generations (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies(id)  on delete cascade,
  location_id      uuid                    references public.locations(id) on delete set null,
  model            text        not null,
  prompt_summary   text,
  insight_count    integer     not null default 0,
  status           text        not null default 'completed',
  created_at       timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

create policy "company members can manage ai_generations"
  on public.ai_generations
  for all
  using (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = ai_generations.company_id
        and cm.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 2. Add ai_generation_id + source_type to insights
--    (idempotent — no-op if columns already exist)
-- ─────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'insights'
      and column_name  = 'ai_generation_id'
  ) then
    alter table public.insights
      add column ai_generation_id uuid references public.ai_generations(id) on delete set null;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'insights'
      and column_name  = 'source_type'
  ) then
    alter table public.insights
      add column source_type text not null default 'ai_generated';
  end if;
end;
$$;
