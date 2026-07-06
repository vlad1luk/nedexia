/**
 * Recalcul du score effectif à partir des « points d'élan » (tâches complétées
 * liées à une dimension). Source de vérité serveur : recompte depuis la base,
 * indépendamment de qui a modifié les tâches (client optimiste ou Eden).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyScoreBonus,
  calculateScore,
  MAX_TASK_BONUS,
} from "@/lib/espace/score";
import { rowToSubmission } from "@/lib/espace/supabase-store";
import { listTasks } from "@/lib/espace/task-store";

export type ScoreSyncResult = {
  score: number;
  tier: string;
  bonus: number;
  delta: number;
};

/** Bonus = nb de tâches complétées liées à une dimension, plafonné. */
export function bonusFromTasks(
  tasks: { status: string; dimensionId: string | null }[]
): number {
  const earned = tasks.filter(
    (t) => t.status === "done" && t.dimensionId
  ).length;
  return Math.min(MAX_TASK_BONUS, earned);
}

/**
 * Recompte le bonus depuis les tâches, réapplique au score brut du dernier
 * diagnostic, persiste si changement. Renvoie le score effectif + le delta.
 */
export async function recomputeScoreFromTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<ScoreSyncResult | null> {
  const { data: diag } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!diag) return null;

  const tasks = await listTasks(supabase, userId);
  const bonus = bonusFromTasks(tasks);

  const submission = rowToSubmission(diag);
  const base = calculateScore(submission);
  const effective = applyScoreBonus(base, bonus);
  const prevTotal = submission.score?.total ?? base.total;

  if (effective.total !== prevTotal || (diag.score_bonus ?? 0) !== bonus) {
    await supabase
      .from("diagnostics")
      .update({
        score: effective,
        score_total: effective.total,
        score_tier: effective.tier,
        score_bonus: bonus,
      })
      .eq("id", diag.id)
      .eq("user_id", userId);
  }

  return {
    score: effective.total,
    tier: effective.tier,
    bonus,
    delta: effective.total - prevTotal,
  };
}
