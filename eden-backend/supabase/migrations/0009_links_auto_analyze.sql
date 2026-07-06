-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Auto-analyse des liens (REQ / site) au premier chargement
-- Marqueur anti-doublon : une fois renseigné, on n'analyse plus
-- automatiquement les liens (Eden peut toujours le refaire à la demande).
-- ════════════════════════════════════════════════════════════════════

alter table public.diagnostics
  add column if not exists links_analyzed_at timestamptz;
