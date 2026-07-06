/**
 * Tracking du décrochage (drop-off) dans le tunnel de diagnostic.
 *
 * Stockage durable dans Supabase (`public.diagnostic_funnel`), via le service
 * role : le tunnel est anonyme (pas d'utilisateur authentifié) et l'admin lit
 * le résumé avec la même clé. Remplace l'ancien stockage fichier JSON qui était
 * éphémère sur les plateformes serverless.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type FunnelSummary = {
  totalSessions: number;
  perScreen: Array<{ screen: number; reached: number; rate: number }>;
};

/** Enregistre l'écran maximal atteint pour une session (best-effort). */
export async function trackScreenReached(
  sessionId: string,
  screen: number
): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("diagnostic_funnel")
    .select("max_screen")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("diagnostic_funnel").insert({
      session_id: sessionId,
      max_screen: screen,
      first_seen: now,
      last_seen: now,
    });
    return;
  }

  await supabase
    .from("diagnostic_funnel")
    .update({
      max_screen: Math.max(existing.max_screen ?? 0, screen),
      last_seen: now,
    })
    .eq("session_id", sessionId);
}

/** Résumé du funnel pour l'admin : nb de sessions ayant atteint chaque écran. */
export async function getFunnelSummary(): Promise<FunnelSummary> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("diagnostic_funnel")
    .select("max_screen");

  const rows = data ?? [];
  const total = rows.length;
  const screens = [0, 1, 2, 3, 4, 5, 6];
  const perScreen = screens.map((screen) => {
    const reached = rows.filter((t) => (t.max_screen ?? 0) >= screen).length;
    return {
      screen,
      reached,
      rate: total > 0 ? Math.round((reached / total) * 100) : 0,
    };
  });
  return { totalSessions: total, perScreen };
}
