import { redirect } from "next/navigation";
import { compactProgression, listScoreHistory } from "@/lib/espace/score-history";
import { rowToSubmission } from "@/lib/espace/supabase-store";
import { listTasks } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/server";
import type { DocItem } from "./documents-dock";
import Workspace from "./workspace";

export const dynamic = "force-dynamic";

/** Pas de nouveau point d'étape si le dernier échange date de moins de 8 h. */
const CHECKIN_COOLDOWN_MS = 8 * 60 * 60 * 1000;

/** Eden ouvre la séance si l'échange précédent date (ou n'existe pas). */
function isCheckinDue(lastMessageAt: string | null): boolean {
  return (
    !lastMessageAt ||
    Date.now() - new Date(lastMessageAt).getTime() > CHECKIN_COOLDOWN_MS
  );
}

export default async function EspaceEntreprisePage() {
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
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
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
      .limit(8),
  ]);

  const submission = diagRow ? rowToSubmission(diagRow) : null;
  const score = submission?.score
    ? { total: submission.score.total, tier: submission.score.tier }
    : null;

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
  let initialMessages: { role: "user" | "assistant"; content: string }[] = [];
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

  const needsCheckin = isCheckinDue(lastMessageAt);

  const dateLabel = new Intl.DateTimeFormat("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <Workspace
      displayName={displayName}
      dateLabel={dateLabel}
      score={score}
      scoreSeries={compactProgression(scoreHistory)}
      hasDiagnostic={submission !== null}
      initialTasks={tasks}
      initialDocs={docs}
      initialConversationId={conversationId}
      initialMessages={initialMessages}
      needsCheckin={needsCheckin}
    />
  );
}
