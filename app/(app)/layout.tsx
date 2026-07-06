import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "./app-header";

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

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex h-svh flex-col bg-background">
      <AppHeader
        companyName={profileRow?.company_name ?? null}
        email={user.email ?? ""}
      />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
