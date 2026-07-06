/**
 * Programme séquencé — l'itinéraire persistant du dirigeant vers son point B.
 *
 * Un jalon = un critère de destination rendu durable, daté et ordonné. Le
 * programme survit hors conversation (table program_milestones), contrairement
 * à un plan improvisé à chaque échange. `syncProgram` le génère à la première
 * lecture et le réconcilie ensuite avec l'état réel du dossier (un critère
 * atteint d'après les données ferme automatiquement son jalon).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { evaluateDestination, type CriterionStatus } from "./destination";
import type { DossierDocSignal } from "./dossier";
import { dueDateInDays, toDateString, type PhaseId } from "./tasks";
import type { DiagnosticSubmission } from "./types";

export type MilestoneStatus = "todo" | "in_progress" | "done";

export type ProgramMilestone = {
  id: string;
  criterionId: string;
  phaseId: PhaseId | null;
  title: string;
  position: number;
  targetDate: string | null;
  status: MilestoneStatus;
  completedAt: string | null;
  /** Statut live du critère d'après les données (peut devancer le statut stocké). */
  criterionStatus: CriterionStatus | null;
};

const COLUMNS =
  "id, criterion_id, phase_id, title, position, target_date, status, completed_at";

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToMilestone(row: any, criterionStatus: CriterionStatus | null = null): ProgramMilestone {
  return {
    id: row.id,
    criterionId: row.criterion_id,
    phaseId: (row.phase_id as PhaseId | null) ?? null,
    title: row.title,
    position: row.position ?? 0,
    targetDate: row.target_date ? toDateString(row.target_date) : null,
    status: (row.status as MilestoneStatus) ?? "todo",
    completedAt: row.completed_at ?? null,
    criterionStatus,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Lecture seule des jalons (ordre du programme). */
export async function listMilestones(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgramMilestone[]> {
  const { data } = await supabase
    .from("program_milestones")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("position", { ascending: true });
  return (data ?? []).map((r) => rowToMilestone(r));
}

/**
 * Génère le programme depuis la destination si absent, puis le réconcilie :
 * un critère « atteint » ferme son jalon ; titres/positions suivent la
 * définition courante. Idempotent — sûr à appeler à chaque chargement.
 */
export async function syncProgram(
  supabase: SupabaseClient,
  userId: string,
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[],
  diagnosticId: string | null
): Promise<ProgramMilestone[]> {
  const destination = evaluateDestination(submission, docs);
  if (!destination) return [];

  const { data: existingRows } = await supabase
    .from("program_milestones")
    .select(COLUMNS)
    .eq("user_id", userId);
  const existing = new Map<string, ReturnType<typeof rowToMilestone>>(
    (existingRows ?? []).map((r) => [r.criterion_id as string, rowToMilestone(r)])
  );

  const result: ProgramMilestone[] = [];

  for (let i = 0; i < destination.criteria.length; i++) {
    const c = destination.criteria[i];
    const current = existing.get(c.id);

    if (!current) {
      // Création : échéance étalée (~2 semaines par jalon), fermé si déjà atteint.
      const isDone = c.status === "met";
      const { data: inserted } = await supabase
        .from("program_milestones")
        .insert({
          user_id: userId,
          diagnostic_id: diagnosticId,
          criterion_id: c.id,
          phase_id: c.phase,
          title: c.label,
          position: i,
          target_date: dueDateInDays((i + 1) * 14),
          status: isDone ? "done" : "todo",
          completed_at: isDone ? new Date().toISOString() : null,
        })
        .select(COLUMNS)
        .maybeSingle();
      if (inserted) result.push(rowToMilestone(inserted, c.status));
      continue;
    }

    // Réconciliation : un critère atteint ferme le jalon ; on ne rouvre jamais.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {};
    if (c.status === "met" && current.status !== "done") {
      patch.status = "done";
      patch.completed_at = new Date().toISOString();
    }
    if (current.title !== c.label) patch.title = c.label;
    if (current.position !== i) patch.position = i;
    if (current.phaseId !== c.phase) patch.phase_id = c.phase;

    if (Object.keys(patch).length > 0) {
      const { data: updated } = await supabase
        .from("program_milestones")
        .update(patch)
        .eq("id", current.id)
        .eq("user_id", userId)
        .select(COLUMNS)
        .maybeSingle();
      result.push(rowToMilestone(updated ?? current, c.status));
    } else {
      result.push({ ...current, criterionStatus: c.status });
    }
  }

  result.sort((a, b) => a.position - b.position);
  return result;
}

/** Avance un jalon (Eden ou utilisateur) — surtout pour les critères « à découvrir ». */
export async function updateMilestone(
  supabase: SupabaseClient,
  userId: string,
  milestoneId: string,
  status: MilestoneStatus
): Promise<ProgramMilestone | null> {
  const { data } = await supabase
    .from("program_milestones")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", milestoneId)
    .eq("user_id", userId)
    .select(COLUMNS)
    .maybeSingle();
  return data ? rowToMilestone(data) : null;
}

/** Le prochain jalon ouvert (le focus courant du programme), ou null si terminé. */
export function nextOpenMilestone(
  milestones: ProgramMilestone[]
): ProgramMilestone | null {
  return milestones.find((m) => m.status !== "done") ?? null;
}
