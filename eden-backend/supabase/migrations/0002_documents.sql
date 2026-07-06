-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Documents du dossier (états financiers, plan d'affaires…)
-- Bucket privé Supabase Storage + table de métadonnées.
-- À exécuter dans Supabase → SQL Editor (après 0001_init.sql).
-- ════════════════════════════════════════════════════════════════════

-- ─────────────── Bucket privé ───────────────

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- ─────────────── Table de métadonnées ───────────────

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  diagnostic_id uuid references public.diagnostics (id) on delete set null,
  name text not null,
  size bigint,
  mime text,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_all_own" on public.documents;
create policy "documents_all_own"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────── RLS sur les objets du bucket ───────────────
-- Convention de chemin : {user_id}/{diagnostic_id}/{fichier}
-- → le 1er segment du nom doit correspondre à l'utilisateur.

drop policy if exists "documents_objects_select_own" on storage.objects;
create policy "documents_objects_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_objects_insert_own" on storage.objects;
create policy "documents_objects_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_objects_delete_own" on storage.objects;
create policy "documents_objects_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
