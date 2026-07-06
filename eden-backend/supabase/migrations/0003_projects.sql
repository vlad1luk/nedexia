-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Projets dans le dossier d'entreprise
-- Un dossier principal par entreprise ; dedans, des projets (subvention,
-- cession, etc.). Les documents peuvent être rattachés à un projet.
-- À exécuter dans Supabase → SQL Editor (après 0002_documents.sql).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id, created_at);

alter table public.projects enable row level security;

drop policy if exists "projects_all_own" on public.projects;
create policy "projects_all_own"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Rattachement optionnel d'un document à un projet
alter table public.documents
  add column if not exists project_id uuid references public.projects (id) on delete set null;

create index if not exists documents_project_id_idx on public.documents (project_id);
