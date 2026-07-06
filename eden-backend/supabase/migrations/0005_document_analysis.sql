-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Analyse des documents par Eden
-- Eden lit les pièces téléversées (PDF / texte), en extrait un résumé et
-- des faits structurés qui enrichissent le dossier et font monter le score.
-- À exécuter dans Supabase → SQL Editor (après 0004_tasks.sql).
-- ════════════════════════════════════════════════════════════════════

alter table public.documents
  add column if not exists analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'processing', 'done', 'failed', 'unsupported')),
  add column if not exists analysis jsonb,
  add column if not exists analyzed_at timestamptz;

create index if not exists documents_analysis_status_idx
  on public.documents (user_id, analysis_status);
