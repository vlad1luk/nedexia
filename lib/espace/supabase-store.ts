/**
 * Accès Supabase pour les diagnostics (remplace le stockage JSON).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { DiagnosticSubmission } from "./types";

/** Transforme une soumission front en ligne `public.diagnostics`. */
export function submissionToRow(
  submission: DiagnosticSubmission,
  userId: string | null
) {
  return {
    user_id: userId,
    session_id: submission.sessionId ?? null,
    email: submission.email ?? null,
    intention: submission.intention ?? null,
    intention_precision: submission.intentionPrecision ?? null,
    req_url: submission.reqUrl ?? null,
    req_skipped: submission.reqSkipped ?? null,
    req_fallback: submission.reqFallback ?? null,
    site_url: submission.siteUrl ?? null,
    site_skipped: submission.siteSkipped ?? null,
    site_fallback: submission.siteFallback ?? null,
    answers_bloc_a: submission.answersBlocA ?? null,
    answers_bloc_b: submission.answersBlocB ?? null,
    answers_bloc_c: submission.answersBlocC ?? null,
    answers_intention: submission.answersIntention ?? null,
    uploaded_file: submission.uploadedFile ?? null,
    score: submission.score ?? null,
    score_total: submission.score?.total ?? null,
    score_tier: submission.score?.tier ?? null,
    score_bonus: submission.score?.bonus ?? 0,
    reached_screen: submission.reachedScreen ?? 6,
    started_at: submission.startedAt ?? null,
    completed_at: submission.completedAt ?? new Date().toISOString(),
  };
}

/** Ligne Supabase → forme `DiagnosticSubmission` (pour l'affichage). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToSubmission(row: any): DiagnosticSubmission & {
  id: string;
  userId: string | null;
} {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    sessionId: row.session_id ?? "",
    startedAt: row.started_at ?? row.created_at,
    completedAt: row.completed_at ?? undefined,
    reachedScreen: row.reached_screen ?? 6,
    intention: row.intention ?? undefined,
    intentionPrecision: row.intention_precision ?? undefined,
    reqUrl: row.req_url ?? undefined,
    reqSkipped: row.req_skipped ?? undefined,
    reqFallback: row.req_fallback ?? undefined,
    siteUrl: row.site_url ?? undefined,
    siteSkipped: row.site_skipped ?? undefined,
    siteFallback: row.site_fallback ?? undefined,
    answersBlocA: row.answers_bloc_a ?? undefined,
    answersBlocB: row.answers_bloc_b ?? undefined,
    answersBlocC: row.answers_bloc_c ?? undefined,
    answersIntention: row.answers_intention ?? undefined,
    uploadedFile: row.uploaded_file ?? undefined,
    score: row.score ?? undefined,
    email: row.email ?? undefined,
  };
}

/** Liste toutes les soumissions (admin, via service role). */
export async function listSubmissionsAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diagnostics")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSubmission);
}
