/**
 * Suivi proactif d'Eden — exécuté chaque jour par un cron (voir vercel.json).
 *
 * Pour chaque dirigeant ayant des tâches ouvertes, construit un « point de la
 * semaine » (actions en retard, rituel du lundi) et le dépose en notification
 * in-app + courriel. C'est ce qui maintient la relation entre deux sessions :
 * Eden n'existe plus seulement quand on ouvre l'app.
 *
 * Protégé par CRON_SECRET (Vercel Cron envoie « Authorization: Bearer <secret> »).
 * Sans RESEND_API_KEY, le courriel est sauté — la notification reste créée.
 */

import { sendEmail } from "@/lib/email/send";
import { buildWeeklyDigest } from "@/lib/espace/digest.server";
import { ensureReminder } from "@/lib/espace/notification-store";
import { rowToTask, type Task } from "@/lib/espace/tasks";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 403 });
  }

  const supabase = createAdminClient();
  const isMonday = new Date().getDay() === 1;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nedexia.com";

  // Toutes les tâches ouvertes, en une requête (service role → pas de RLS).
  const { data: taskRows } = await supabase
    .from("tasks")
    .select("*")
    .in("status", ["pending", "in_progress"]);

  const byUser = new Map<string, Task[]>();
  for (const r of taskRows ?? []) {
    const uid = (r as { user_id: string }).user_id;
    const arr = byUser.get(uid) ?? [];
    arr.push(rowToTask(r));
    byUser.set(uid, arr);
  }

  const userIds = [...byUser.keys()];
  if (userIds.length === 0) {
    return Response.json({ ok: true, processed: 0, notified: 0, emailed: 0 });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, email")
    .in("id", userIds);
  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p])
  );

  let notified = 0;
  let emailed = 0;

  for (const uid of userIds) {
    const tasks = byUser.get(uid)!;
    const p = profileById.get(uid);
    const displayName =
      (p?.full_name as string | null) ||
      (p?.company_name as string | null) ||
      "vous";

    const digest = buildWeeklyDigest({ displayName, tasks, isMonday, siteUrl });
    if (!digest) continue;

    // ensureReminder dédoublonne (20 h) avec le rappel créé à l'ouverture de page.
    const note = await ensureReminder(
      supabase,
      uid,
      {
        kind: "reminder",
        title: digest.notificationTitle,
        body: digest.notificationBody,
        href: "#plan",
      },
      20
    );
    if (!note) continue;
    notified++;

    const email = p?.email as string | null;
    if (email) {
      const sent = await sendEmail({
        to: email,
        subject: digest.emailSubject,
        text: digest.emailText,
      });
      if (sent) emailed++;
    }
  }

  return Response.json({
    ok: true,
    processed: userIds.length,
    notified,
    emailed,
  });
}
