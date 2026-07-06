import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileInput = {
  companyName?: string | null;
  fullName?: string | null;
  sector?: string | null;
  goal?: string | null;
};

/**
 * Met à jour le profil entreprise de l'utilisateur courant.
 * Découplé du diagnostic : ces champs servent uniquement à l'affichage
 * (nom, secteur, objectif) et n'impactent pas le calcul du score.
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: ProfileInput
): Promise<void> {
  const patch: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };
  if (input.companyName !== undefined) patch.company_name = input.companyName;
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.sector !== undefined) patch.sector = input.sector;
  if (input.goal !== undefined) patch.goal = input.goal;

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) throw error;
}
