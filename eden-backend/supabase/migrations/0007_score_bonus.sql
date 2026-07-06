-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Points d'élan (score bonus)
-- Compléter des actions liées à une dimension fait progresser le score
-- au-delà du diagnostic brut : un bonus persisté, plafonné, ajouté au total.
-- À exécuter dans Supabase → SQL Editor (après 0006_crm.sql).
-- ════════════════════════════════════════════════════════════════════

alter table public.diagnostics
  add column if not exists score_bonus int not null default 0;
