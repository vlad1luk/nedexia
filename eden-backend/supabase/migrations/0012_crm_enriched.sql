-- ════════════════════════════════════════════════════════════════════
-- Nedexia · CRM enrichi — priorités, prochaines actions, probabilité
-- À exécuter dans Supabase → SQL Editor (après 0011_projects_crm.sql).
-- ════════════════════════════════════════════════════════════════════

alter table public.contacts
  add column if not exists priority text not null default 'normal'
    check (priority in ('high', 'normal', 'low')),
  add column if not exists next_action text,
  add column if not exists next_action_date date,
  add column if not exists last_contacted_at timestamptz;

alter table public.opportunities
  add column if not exists priority text not null default 'normal'
    check (priority in ('high', 'normal', 'low')),
  add column if not exists next_action text,
  add column if not exists expected_close_date date,
  add column if not exists probability integer
    check (probability is null or (probability >= 0 and probability <= 100));

create index if not exists opportunities_contact_idx
  on public.opportunities (contact_id)
  where contact_id is not null;

create index if not exists opportunities_project_idx
  on public.opportunities (project_id)
  where project_id is not null;

create index if not exists contacts_next_action_idx
  on public.contacts (user_id, next_action_date)
  where next_action_date is not null;
