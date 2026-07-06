-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Profil entreprise éditable
-- Ajoute le secteur et l'objectif au profil pour permettre une édition
-- découplée du diagnostic (qui reste la source du score).
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists sector text,
  add column if not exists goal text;
