import { trackScreenReached } from "@/lib/espace/funnel-store";

export const runtime = "nodejs";

/**
 * POST /api/diagnostic/track
 *
 * Reçoit un ping à chaque transition d'écran pendant le tunnel.
 * Sert à mesurer le taux de complétion par étape (drop-off analytics).
 *
 * Payload : `{ sessionId: string, screen: number }`. Tout retour 2xx est OK ;
 * les erreurs ne doivent pas remonter au client (best-effort).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const { sessionId, screen } = (body ?? {}) as {
    sessionId?: string;
    screen?: number;
  };

  if (
    typeof sessionId !== "string" ||
    typeof screen !== "number" ||
    Number.isNaN(screen)
  ) {
    return new Response(null, { status: 204 });
  }

  try {
    await trackScreenReached(sessionId, screen);
  } catch (err) {
    console.error("[diagnostic/track]", err);
  }

  return new Response(null, { status: 204 });
}
