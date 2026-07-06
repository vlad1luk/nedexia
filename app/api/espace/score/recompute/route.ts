import { recomputeScoreFromTasks } from "@/lib/eden/score-sync.server";
import { insertNotification } from "@/lib/espace/notification-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/espace/score/recompute
 * Recompte les points d'élan à partir des tâches complétées et met à jour le
 * score du diagnostic. Appelé après qu'une tâche change de statut (client ou
 * Eden). Renvoie le score effectif, le delta et la notification éventuelle.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const result = await recomputeScoreFromTasks(supabase, user.id);
  if (!result) {
    return Response.json({ ok: false, reason: "no-diagnostic" }, { status: 200 });
  }

  let notification = null;
  if (result.delta > 0) {
    notification = await insertNotification(supabase, user.id, {
      kind: "score",
      title: `Score +${result.delta} point${result.delta > 1 ? "s" : ""}`,
      body: "Vos actions complétées font progresser votre dossier.",
      href: "#overview",
    });
  }

  return Response.json({ ok: true, ...result, notification }, { status: 200 });
}
