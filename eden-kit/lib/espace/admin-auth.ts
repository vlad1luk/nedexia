/**
 * Authentification ultra-minimale de l'admin pour le test pilote.
 *
 * Une URL secrète `?key=...` ou un header `x-admin-key` doit correspondre à
 * la variable d'env `ADMIN_DIAGNOSTIC_KEY`. Pas de session, pas de cookies —
 * c'est un MVP de test, pas un produit.
 *
 * Pour la prod : remplacer par NextAuth + middleware côté `/admin/*`.
 */

export function getAdminKey(): string | null {
  const key = process.env.ADMIN_DIAGNOSTIC_KEY;
  return typeof key === "string" && key.length > 0 ? key : null;
}

export function adminKeyMatches(
  candidate: string | null | undefined
): boolean {
  const expected = getAdminKey();
  if (!expected) {
    // Si aucune clé n'est définie côté serveur, on bloque par défaut en prod
    // mais on autorise tout en développement pour faciliter le test local.
    return process.env.NODE_ENV !== "production";
  }
  if (!candidate) return false;
  return candidate === expected;
}
