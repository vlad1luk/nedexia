import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET/POST /auth/signout
 *
 * Termine la session Supabase côté serveur (cookies) puis redirige.
 * ?next=/ chemin relatif optionnel après déconnexion.
 */
async function signOutAndRedirect(request: Request) {
  const url = new URL(request.url);
  const nextParam = url.searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(next, url.origin));
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}
