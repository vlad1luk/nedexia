import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase côté serveur (Server Components, Route Handlers, Server Actions).
 * Lit/écrit la session via les cookies de la requête.
 *
 * Next.js 16 : `cookies()` est asynchrone.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component — l'écriture de cookies y est
            // impossible. Le rafraîchissement de session est géré par proxy.ts.
          }
        },
      },
    }
  );
}
