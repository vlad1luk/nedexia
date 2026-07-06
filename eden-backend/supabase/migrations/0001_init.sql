-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Schéma initial (auth + diagnostics + conversations Eden)
-- À exécuter dans Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Profils ───────────────
-- Un profil par utilisateur authentifié (1:1 avec auth.users).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────── Diagnostics ───────────────
-- Une soumission du tunnel par dirigeant. Liée à un user après auth.

create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  email text,

  intention text,
  intention_precision text,

  req_url text,
  req_skipped boolean,
  req_fallback jsonb,

  site_url text,
  site_skipped boolean,
  site_fallback jsonb,

  answers_bloc_a jsonb,
  answers_bloc_b jsonb,
  answers_bloc_c jsonb,
  answers_intention jsonb,
  uploaded_file jsonb,

  score jsonb,
  score_total int,
  score_tier text,

  reached_screen int default 6,
  started_at timestamptz,
  completed_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index if not exists diagnostics_user_id_idx on public.diagnostics (user_id);
create index if not exists diagnostics_created_at_idx on public.diagnostics (created_at desc);

alter table public.diagnostics enable row level security;

drop policy if exists "diagnostics_select_own" on public.diagnostics;
create policy "diagnostics_select_own"
  on public.diagnostics for select
  using (auth.uid() = user_id);

drop policy if exists "diagnostics_insert_own" on public.diagnostics;
create policy "diagnostics_insert_own"
  on public.diagnostics for insert
  with check (auth.uid() = user_id);

drop policy if exists "diagnostics_update_own" on public.diagnostics;
create policy "diagnostics_update_own"
  on public.diagnostics for update
  using (auth.uid() = user_id);

-- ─────────────── Conversations Eden ───────────────
-- Préparé pour le chat (UI d'abord, IA branchée plus tard).

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on public.conversations (user_id, updated_at desc);

alter table public.conversations enable row level security;

drop policy if exists "conversations_all_own" on public.conversations;
create policy "conversations_all_own"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_all_own" on public.messages;
create policy "messages_all_own"
  on public.messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
