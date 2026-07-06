import { autoAnalyzeLinks } from "@/lib/eden/auto-analyze.server";
import { insertNotification } from "@/lib/espace/notification-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/espace/links/auto-analyze
 * Analyse automatiquement la fiche REQ et/ou le site fournis au diagnostic,
 * enrichit le dossier et recalcule le score. Garde-fou anti-doublon côté
 * helper (réclamation atomique via `links_analyzed_at`).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const result = await autoAnalyzeLinks(supabase, user.id);
  if (!result || result.ran.length === 0) {
    return Response.json({ ok: false, reason: "nothing-to-do" }, { status: 200 });
  }

  let notification = null;
  const label = result.ran.includes("req")
    ? result.ran.includes("site")
      ? "Fiche REQ et site analysés"
      : "Fiche REQ analysée"
    : "Site web analysé";
  notification = await insertNotification(supabase, user.id, {
    kind: "score",
    title:
      result.delta > 0
        ? `Score +${result.delta} point${result.delta > 1 ? "s" : ""}`
        : "Dossier enrichi",
    body: `${label} automatiquement par Eden.`,
    href: "#overview",
  });

  return Response.json({ ok: true, ...result, notification }, { status: 200 });
}
