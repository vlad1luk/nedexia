-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Tracking du tunnel de diagnostic (drop-off analytics)
-- Remplace l'ancien stockage fichier JSON (éphémère en serverless) par une
-- table durable. Accès réservé au service role : le tunnel est anonyme et
-- l'admin lit le résumé via la clé service. Aucune policy RLS publique.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.diagnostic_funnel (
  session_id text primary key,
  max_screen int not null default 0,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.diagnostic_funnel enable row level security;
