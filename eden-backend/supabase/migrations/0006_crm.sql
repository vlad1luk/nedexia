-- ════════════════════════════════════════════════════════════════════
-- Nedexia · CRM entreprise + notifications
-- Transforme le dossier en hub CRM : contacts (clients, partenaires,
-- repreneurs…) et opportunités (commerce, alliance, cession, acquisition),
-- pilotables par le dirigeant et par Eden. + notifications in-app.
-- À exécuter dans Supabase → SQL Editor (après 0005_document_analysis.sql).
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Contacts ───────────────

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  title text,
  organization text,
  contact_type text not null default 'autre'
    check (contact_type in (
      'client', 'prospect', 'partenaire', 'conseiller',
      'repreneur', 'investisseur', 'fournisseur', 'autre'
    )),
  email text,
  phone text,
  notes text,
  source text not null default 'user'
    check (source in ('eden', 'user', 'system')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_user_idx on public.contacts (user_id, created_at desc);

alter table public.contacts enable row level security;

drop policy if exists "contacts_all_own" on public.contacts;
create policy "contacts_all_own"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists contacts_touch_updated_at on public.contacts;
create trigger contacts_touch_updated_at
  before update on public.contacts
  for each row execute function public.touch_updated_at();

-- ─────────────── Opportunités (pipeline) ───────────────

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,

  title text not null,
  opp_type text not null default 'commerce'
    check (opp_type in (
      'commerce', 'alliance', 'cession', 'acquisition', 'financement', 'autre'
    )),
  stage text not null default 'qualification'
    check (stage in (
      'qualification', 'discussion', 'proposition', 'negociation', 'gagne', 'perdu'
    )),
  value numeric,
  notes text,
  source text not null default 'user'
    check (source in ('eden', 'user', 'system')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_user_idx
  on public.opportunities (user_id, created_at desc);
create index if not exists opportunities_stage_idx
  on public.opportunities (user_id, stage);

alter table public.opportunities enable row level security;

drop policy if exists "opportunities_all_own" on public.opportunities;
create policy "opportunities_all_own"
  on public.opportunities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists opportunities_touch_updated_at on public.opportunities;
create trigger opportunities_touch_updated_at
  before update on public.opportunities
  for each row execute function public.touch_updated_at();

-- ─────────────── Notifications in-app ───────────────

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  kind text not null default 'info'
    check (kind in ('task', 'document', 'score', 'opportunity', 'contact', 'reminder', 'info')),
  title text not null,
  body text,
  href text,
  read boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id, read);

alter table public.notifications enable row level security;

drop policy if exists "notifications_all_own" on public.notifications;
create policy "notifications_all_own"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
