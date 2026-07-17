import { redirect } from "next/navigation";
import { listMilestones } from "@/lib/espace/program";
import { listScoreHistory } from "@/lib/espace/score-history";
import { rowToSubmission } from "@/lib/espace/supabase-store";
import { listTasks } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/server";
import type { DocItem } from "./documents-dock";
import { EspaceProvider, type Message } from "./espace-context";
import { EspaceShell } from "./shell";

export const dynamic = "force-dynamic";

/**
 * Layout de l'espace entreprise — le fetch unique.
 *
 * Toutes les données partagées sont chargées ici, une fois, puis confiées au
 * provider client : les pages (Accueil, Préparation, Programme…) sont des
 * composants clients minces qui lisent le même état. Le layout — sidebar et
 * panneau Eden compris — reste monté au changement de page ; seul `children`
 * se remplace, sans re-fetch ni flash.
 */

/** Pas de nouveau point d'étape si le dernier échange date de moins de 8 h. */
const CHECKIN_COOLDOWN_MS = 8 * 60 * 60 * 1000;

/** Eden ouvre la séance si l'échange précédent date (ou n'existe pas). */
function isCheckinDue(lastMessageAt: string | null): boolean {
  return (
    !lastMessageAt ||
    Date.now() - new Date(lastMessageAt).getTime() > CHECKIN_COOLDOWN_MS
  );
}

export default async function EspaceEntrepriseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/espace/entreprise");

  const [
    { data: profileRow },
    { data: diagRow },
    tasks,
    { data: convRow },
    scoreHistory,
    { data: docRows },
    milestones,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    listTasks(supabase, user.id),
    supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    listScoreHistory(supabase, user.id),
    supabase
      .from("documents")
      .select("id, name, size, analysis_status, analysis")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60),
    listMilestones(supabase, user.id),
  ]);

  const submission = diagRow ? rowToSubmission(diagRow) : null;
  const score = submission?.score
    ? { total: submission.score.total, tier: submission.score.tier }
    : null;
  const scoreDimensions = submission?.score?.dimensions ?? null;

  const displayName =
    profileRow?.full_name?.split(" ")[0] ||
    (user.email ? user.email.split("@")[0] : "vous");

  const docs: DocItem[] = (docRows ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => ({
      id: d.id,
      name: d.name,
      size: d.size ?? null,
      analysisStatus: d.analysis_status ?? "pending",
      docType: d.analysis?.docType ?? null,
    })
  );

  // Reprend le fil de la dernière conversation (les 30 derniers messages).
  let initialMessages: Message[] = [];
  let lastMessageAt: string | null = null;
  const conversationId: string | null = convRow?.id ?? null;
  if (conversationId) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(30);
    lastMessageAt = msgs?.[0]?.created_at ?? null;
    initialMessages = (msgs ?? [])
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  }

  const dateLabel = new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <EspaceProvider
      displayName={displayName}
      companyName={profileRow?.company_name ?? null}
      email={user.email ?? ""}
      dateLabel={dateLabel}
      hasDiagnostic={submission !== null}
      initialScore={score}
      scoreDimensions={scoreDimensions}
      initialScoreHistory={scoreHistory}
      initialTasks={tasks}
      initialDocs={docs}
      initialMilestones={milestones}
      initialConversationId={conversationId}
      initialMessages={initialMessages}
      needsCheckin={isCheckinDue(lastMessageAt)}
    >
      <EspaceShell>{children}</EspaceShell>
    </EspaceProvider>
  );
}
