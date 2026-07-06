-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Résumé de session
-- Résumé court (2-3 lignes) généré par Eden à la fin de chaque échange.
-- Les derniers résumés sont injectés dans le contexte des conversations
-- suivantes pour donner à Eden une continuité « de quoi on a parlé ».
-- À exécuter dans Supabase → SQL Editor (après 0013_eden_notes.sql).
-- ════════════════════════════════════════════════════════════════════

alter table public.conversations
  add column if not exists summary text;
