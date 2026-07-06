-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Projets en mode CRM
-- Les projets deviennent un véritable espace de travail : statut, objectif,
-- dossiers libres (project_folders) et documents rangés dans ces dossiers.
-- Eden peut créer des projets/dossiers, y ajouter des tâches et y générer
-- des documents.
-- À exécuter dans Supabase → SQL Editor (après 0010_diagnostic_funnel.sql).
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Enrichissement de la table projects ───────────────

alter table public.projects
  add column if not exists description text,
  add column if not exists objective text,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'on_hold', 'done', 'archived')),
  add column if not exists target_date date;

-- Maintien automatique de updated_at (fonction définie en 0004_tasks.sql)
drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ─────────────── Dossiers de projet ───────────────

create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_folders_project_idx
  on public.project_folders (project_id);
create index if not exists project_folders_user_idx
  on public.project_folders (user_id, created_at);

alter table public.project_folders enable row level security;

drop policy if exists "project_folders_all_own" on public.project_folders;
create policy "project_folders_all_own"
  on public.project_folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────── Rattachement d'un document à un dossier ───────────────

alter table public.documents
  add column if not exists folder_id uuid
    references public.project_folders (id) on delete set null;

create index if not exists documents_folder_id_idx on public.documents (folder_id);
