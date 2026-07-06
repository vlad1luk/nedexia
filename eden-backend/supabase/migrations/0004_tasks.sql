-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Plan d'action (tâches + journal d'événements)
-- Le cœur du MVP d'accompagnement : Eden et l'entrepreneur créent des
-- tâches datées, suivies dans le temps et reliées au score / à la roadmap.
-- À exécuter dans Supabase → SQL Editor (après 0003_projects.sql).
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Tâches ───────────────

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  diagnostic_id uuid references public.diagnostics (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,

  title text not null,
  description text,

  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'done', 'skipped', 'blocked')),
  priority text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  source text not null default 'eden'
    check (source in ('eden', 'user', 'system')),

  -- Lien au score (clarte, independance, finances, structure, reputation)
  dimension_id text,
  -- Lien à la roadmap (diagnostic, fondations, structuration, optimisation, cercle)
  phase_id text,

  due_date date not null,
  completed_at timestamptz,
  blocked_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_due_idx
  on public.tasks (user_id, due_date);
create index if not exists tasks_user_status_idx
  on public.tasks (user_id, status);
create index if not exists tasks_project_idx
  on public.tasks (project_id);

alter table public.tasks enable row level security;

drop policy if exists "tasks_all_own" on public.tasks;
create policy "tasks_all_own"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Maintien automatique de updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ─────────────── Journal d'événements (activité) ───────────────

create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null
    check (event_type in (
      'created', 'updated', 'completed', 'skipped', 'blocked', 'rescheduled', 'reopened'
    )),
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task_events_user_idx
  on public.task_events (user_id, created_at desc);
create index if not exists task_events_task_idx
  on public.task_events (task_id, created_at desc);

alter table public.task_events enable row level security;

drop policy if exists "task_events_all_own" on public.task_events;
create policy "task_events_all_own"
  on public.task_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
