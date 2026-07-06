-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Mémoire du tuteur Eden
-- Notes durables prises par Eden au fil des conversations : le sommet
-- (vision 5 ans), le contexte humain, les faits d'entreprise clés et les
-- préférences. Injectées dans le contexte de chaque échange pour donner
-- à Eden une continuité de relation entre les conversations.
-- À exécuter dans Supabase → SQL Editor (après 0012_crm_enriched.sql).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.eden_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  kind text not null default 'fait'
    check (kind in ('sommet', 'humain', 'entreprise', 'fait', 'preference')),
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists eden_notes_user_idx
  on public.eden_notes (user_id, created_at desc);

alter table public.eden_notes enable row level security;

drop policy if exists "eden_notes_all_own" on public.eden_notes;
create policy "eden_notes_all_own"
  on public.eden_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists eden_notes_touch_updated_at on public.eden_notes;
create trigger eden_notes_touch_updated_at
  before update on public.eden_notes
  for each row execute function public.touch_updated_at();
