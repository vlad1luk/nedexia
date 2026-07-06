-- ════════════════════════════════════════════════════════════════════
-- Nedexia · Historique du score (trajectoire A → B)
-- Conserve un instantané du score à chaque variation, pour qu'Eden et le
-- workspace puissent raconter le chemin parcouru — pas juste l'instant T.
-- Alimenté automatiquement par un trigger sur `diagnostics` : tous les
-- chemins qui modifient le score (diagnostic, outils Eden, recompute des
-- points d'élan, auto-analyse REQ/site, analyse de documents) écrivent
-- `score_total`, donc tous sont captés sans câblage applicatif.
-- À exécuter dans Supabase → SQL Editor (après 0007_score_bonus.sql).
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  diagnostic_id uuid references public.diagnostics (id) on delete cascade,
  total int not null,
  tier text,
  bonus int not null default 0,
  dimensions jsonb,
  created_at timestamptz not null default now()
);

create index if not exists score_history_user_idx
  on public.score_history (user_id, created_at);

alter table public.score_history enable row level security;

-- Lecture de son propre historique. Les insertions passent uniquement par le
-- trigger (SECURITY DEFINER) — pas d'insertion directe côté client.
drop policy if exists "score_history_select_own" on public.score_history;
create policy "score_history_select_own"
  on public.score_history for select
  using (auth.uid() = user_id);

-- ─────────────── Trigger : snapshot à chaque changement de score ───────────────

create or replace function public.snapshot_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Diagnostic anonyme (funnel) ou score absent : rien à historiser.
  if NEW.user_id is null or NEW.score_total is null then
    return NEW;
  end if;

  -- Sur une mise à jour qui ne change ni le total ni le palier : on n'ajoute
  -- pas de point redondant (évite le bruit des recalculs sans effet).
  if TG_OP = 'UPDATE'
     and NEW.score_total is not distinct from OLD.score_total
     and NEW.score_tier is not distinct from OLD.score_tier then
    return NEW;
  end if;

  insert into public.score_history
    (user_id, diagnostic_id, total, tier, bonus, dimensions)
  values (
    NEW.user_id,
    NEW.id,
    NEW.score_total,
    NEW.score_tier,
    coalesce(NEW.score_bonus, 0),
    NEW.score -> 'dimensions'
  );

  return NEW;
end;
$$;

drop trigger if exists diagnostics_snapshot_score on public.diagnostics;
create trigger diagnostics_snapshot_score
  after insert or update on public.diagnostics
  for each row execute function public.snapshot_score();
