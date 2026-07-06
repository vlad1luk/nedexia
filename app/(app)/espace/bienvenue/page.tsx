import { BienvenueFinalizer } from "./bienvenue-finalizer";

export const dynamic = "force-dynamic";

/**
 * Étape charnière après la connexion : le diagnostic complété dans le tunnel
 * (localStorage) est envoyé à /api/diagnostic/submit, puis on redirige vers
 * l'espace entreprise. L'auth est garantie par le layout (app).
 */
export default function BienvenuePage() {
  return <BienvenueFinalizer />;
}
