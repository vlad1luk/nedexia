import type { DiagnosticSubmission } from "@/lib/espace/types";
import { submissionToRow } from "@/lib/espace/supabase-store";
import { buildInitialTasks } from "@/lib/espace/task-templates";
import { insertTasks } from "@/lib/espace/task-store";
import { syncProgram } from "@/lib/espace/program";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Crée les 3 tâches initiales pour un diagnostic, une seule fois.
 * Idempotent : ne fait rien si des tâches existent déjà pour ce diagnostic.
 */
async function seedInitialTasks(
  supabase: SupabaseClient,
  userId: string,
  diagnosticId: string,
  submission: DiagnosticSubmission
): Promise<void> {
  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("diagnostic_id", diagnosticId);

  if (count && count > 0) return;

  const seeds = buildInitialTasks(submission);
  await insertTasks(supabase, userId, seeds, {
    diagnosticId,
    source: "system",
  });
}

/**
 * POST /api/diagnostic/submit
 *
 * Sauvegarde la soumission complète dans Supabase, liée à l'utilisateur
 * authentifié, puis initialise le plan d'action (3 tâches) et le programme
 * jalonné vers le point B (syncProgram, idempotent).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps invalide" }, { status: 400 });
  }

  const submission = body as Partial<DiagnosticSubmission>;

  if (!submission || !submission.intention || !submission.score) {
    return Response.json(
      { error: "Champs requis manquants (intention, score)." },
      { status: 422 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "Authentification requise pour sauvegarder le diagnostic." },
      { status: 401 }
    );
  }

  const row = submissionToRow(
    {
      ...(submission as DiagnosticSubmission),
      email: submission.email ?? user.email ?? undefined,
      completedAt: submission.completedAt ?? new Date().toISOString(),
      reachedScreen: 6,
    },
    user.id
  );

  const finalize = async (diagnosticId: string) => {
    await seedInitialTasks(
      supabase,
      user.id,
      diagnosticId,
      submission as DiagnosticSubmission
    );
    // Génère (ou réconcilie) l'itinéraire jalonné vers le point B.
    await syncProgram(
      supabase,
      user.id,
      submission as DiagnosticSubmission,
      [],
      diagnosticId
    );
  };

  // Évite les doublons si l'utilisateur recharge /espace/bienvenue
  if (submission.sessionId) {
    const { data: existing } = await supabase
      .from("diagnostics")
      .select("id")
      .eq("user_id", user.id)
      .eq("session_id", submission.sessionId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("diagnostics")
        .update(row)
        .eq("id", existing.id);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      await finalize(existing.id);
      return Response.json({ ok: true, id: existing.id });
    }
  }

  const { data, error } = await supabase
    .from("diagnostics")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[diagnostic/submit]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await finalize(data.id);

  return Response.json({ ok: true, id: data.id });
}
