import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role — contourne RLS.
 * À utiliser UNIQUEMENT côté serveur (route handlers, jamais exposé au client),
 * par exemple pour les exports admin agrégés.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin non configuré : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
