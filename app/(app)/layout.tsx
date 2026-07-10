import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Votre espace — Nedexia",
  description:
    "L'espace privé de votre entreprise : Eden, votre plan d'action et votre progression, au même endroit.",
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // L'identité et le compte vivent dans le rail du cabinet (workspace) —
  // le layout se contente de donner toute la hauteur à la page.
  return (
    <div className="flex h-svh flex-col bg-background">
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
