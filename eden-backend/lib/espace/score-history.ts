/**
 * Historique du score dans le temps (trajectoire A → B).
 * Alimenté par le trigger `snapshot_score` (migration 0015) ; ici on ne fait
 * que lire la série, pour Eden (récit de progression) et le futur graphe.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ScoreHistoryPoint = {
  total: number;
  tier: string | null;
  createdAt: string;
};

/** Série chronologique du score (du plus ancien au plus récent). */
export async function listScoreHistory(
  supabase: SupabaseClient,
  userId: string,
  limit = 60
): Promise<ScoreHistoryPoint[]> {
  const { data } = await supabase
    .from("score_history")
    .select("total, tier, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map((r) => ({
    total: r.total as number,
    tier: (r.tier as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

/**
 * Réduit la série à ses points significatifs : on ne garde un relevé que
 * lorsque le score change de valeur, pour un récit lisible (42 → 51 → 58).
 */
export function compactProgression(history: ScoreHistoryPoint[]): number[] {
  const out: number[] = [];
  for (const p of history) {
    if (out.length === 0 || out[out.length - 1] !== p.total) {
      out.push(p.total);
    }
  }
  return out;
}
