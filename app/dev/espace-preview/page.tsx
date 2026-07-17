import { notFound } from "next/navigation";
import { PreviewClient, type PreviewPage } from "./preview-client";

/**
 * Prévisualisation DEV de l'espace entreprise — données fictives, aucune
 * authentification. Sert à vérifier le shell (sidebar, panneau Eden, palette,
 * responsive) et chaque page sans compte Supabase. Introuvable en production.
 *
 * Usage : /dev/espace-preview?page=accueil|preparation|programme|financement|documents|matching|parametres
 */
export default async function EspacePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { page } = await searchParams;
  return <PreviewClient page={(page as PreviewPage) ?? "accueil"} />;
}
