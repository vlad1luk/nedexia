-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Programme séquencé (jalons vers le point B) + preuve de complétion
--
-- 1. program_milestones : l'itinéraire persistant du dirigeant vers sa
--    destination — un jalon par critère de destination, ordonné et daté.
--    Eden et l'utilisateur le voient et le font avancer ; il survit hors
--    conversation (contrairement à un plan improvisé à chaque échange).
-- 2. tasks.milestone_id : rattache une action hebdo au jalon qu'elle sert.
-- 3. tasks.proof_note : trace de « comment on sait que c'est fait » sur les
--    tâches à fort enjeu (vérification de complétion durable).
--
-- À exécuter dans Supabase → SQL Editor (après 0015_score_history.sql).
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Jalons du programme ───────────────

create table if not exists public.program_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  diagnostic_id uuid references public.diagnostics (id) on delete set null,

  -- Critère de destination correspondant (ex. independance, valorisation).
  criterion_id text not null,
  -- Phase du parcours (diagnostic, fondations, structuration, optimisation, cercle).
  phase_id text,

  title text not null,
  position int not null default 0,
  target_date date,

  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un seul jalon par critère et par dirigeant (upsert idempotent).
create unique index if not exists program_milestones_user_criterion_idx
  on public.program_milestones (user_id, criterion_id);
create index if not exists program_milestones_user_pos_idx
  on public.program_milestones (user_id, position);

alter table public.program_milestones enable row level security;

drop policy if exists "program_milestones_all_own" on public.program_milestones;
create policy "program_milestones_all_own"
  on public.program_milestones for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists program_milestones_touch_updated_at on public.program_milestones;
create trigger program_milestones_touch_updated_at
  before update on public.program_milestones
  for each row execute function public.touch_updated_at();

-- ─────────────── Tâches : lien jalon + preuve de complétion ───────────────

alter table public.tasks
  add column if not exists milestone_id uuid
    references public.program_milestones (id) on delete set null;

alter table public.tasks
  add column if not exists proof_note text;

create index if not exists tasks_milestone_idx
  on public.tasks (milestone_id);
