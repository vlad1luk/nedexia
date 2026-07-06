import {
  buildEdenSystemPrompt,
  type DocContextItem,
  type EdenProfile,
  type EdenRelationMeta,
  type PastConversationSummary,
} from "@/lib/eden/context";
import { listEdenNotes } from "@/lib/eden/notes-store";
import { listScoreHistory } from "@/lib/espace/score-history";
import { syncProgram, type ProgramMilestone } from "@/lib/espace/program";
import { rowToSubmission } from "@/lib/espace/supabase-store";
import { listTasks } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-5.5";

/** Pas de nouveau point d'étape si le dernier échange date de moins de 8 h. */
const CHECKIN_COOLDOWN_MS = 8 * 60 * 60 * 1000;

const CHECKIN_INSTRUCTION = `
## OUVERTURE DE SÉANCE (consigne ponctuelle)
La personne vient d'arriver dans son espace et n'a encore rien écrit aujourd'hui. C'est TOI qui ouvres la séance, comme un tuteur qui accueille. Rédige un point d'étape bref — 3 à 6 phrases, en prose, PAS de liste, PAS de titre :
- Accueille par le prénom, simplement (pas de « Bonjour ! » suivi d'un paragraphe de politesse).
- Situe la personne sur son chemin : le jalon en cours, un progrès récent (score, action complétée) si réel.
- Fais le point sur les actions : célèbre sobrement ce qui est fait ; si quelque chose est en retard, une question curieuse — jamais un reproche.
- Termine par UNE question précise qui invite à répondre maintenant.
Ne récite pas le dossier : choisis ce qui compte aujourd'hui. Si c'est un premier échange, applique la règle « l'humain avant l'entreprise ».`;

function sseLine(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/**
 * POST /api/eden/checkin
 *
 * Génère l'ouverture de séance d'Eden (point d'étape personnalisé), la
 * streame au client et la persiste comme message assistant de la
 * conversation courante — la suite de l'échange la retrouve naturellement.
 */
export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY n'est pas configurée." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const [
    { data: diagRow },
    { data: profileRow },
    tasks,
    edenNotes,
    { count: convCount },
    { data: convRow },
    { data: summaryRows },
    scoreHistory,
    { data: docRows },
  ] = await Promise.all([
    supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, company_name, email, sector, goal")
      .eq("id", user.id)
      .maybeSingle(),
    listTasks(supabase, user.id),
    listEdenNotes(supabase, user.id),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("conversations")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select("id, title, summary, updated_at")
      .eq("user_id", user.id)
      .not("summary", "is", null)
      .order("updated_at", { ascending: false })
      .limit(3),
    listScoreHistory(supabase, user.id),
    supabase
      .from("documents")
      .select("id, name, analysis_status, analysis")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const docContext: DocContextItem[] = (docRows ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => ({
      id: d.id,
      name: d.name,
      analysisStatus: d.analysis_status ?? "pending",
      docType: d.analysis?.docType ?? null,
      summary: d.analysis?.summary ?? null,
    })
  );

  // Dernier message de l'utilisateur ou d'Eden — pour le cooldown + relation.
  const { data: lastMsgRow } = await supabase
    .from("messages")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastAt = lastMsgRow?.created_at
    ? new Date(lastMsgRow.created_at).getTime()
    : null;
  if (lastAt && Date.now() - lastAt < CHECKIN_COOLDOWN_MS) {
    return Response.json({ skip: true, conversationId: convRow?.id ?? null });
  }

  const submission = diagRow ? rowToSubmission(diagRow) : null;

  const program: ProgramMilestone[] = submission
    ? await syncProgram(supabase, user.id, submission, [], diagRow?.id ?? null)
    : [];

  const profile: EdenProfile = {
    displayName:
      profileRow?.full_name ||
      profileRow?.company_name ||
      (user.email ? user.email.split("@")[0] : "vous"),
    companyName: profileRow?.company_name ?? null,
    email: profileRow?.email ?? user.email ?? null,
    sector: profileRow?.sector ?? null,
    goal: profileRow?.goal ?? null,
  };

  const relation: EdenRelationMeta = {
    conversationCount: Math.max(1, convCount ?? 0),
    lastExchangeAt: lastMsgRow?.created_at ?? null,
  };

  const pastSummaries: PastConversationSummary[] = (summaryRows ?? [])
    .filter((r) => r.summary)
    .map((r) => ({
      title: r.title,
      summary: r.summary as string,
      updatedAt: r.updated_at ?? null,
    }));

  // Conversation courante (créée si absente) — le point d'étape en fait partie.
  let conversationId: string | null = convRow?.id ?? null;
  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "Point d'étape" })
      .select("id")
      .single();
    if (error || !created) {
      return Response.json(
        { error: "Impossible d'ouvrir la conversation." },
        { status: 500 }
      );
    }
    conversationId = created.id;
  }

  // Les derniers messages pour qu'Eden reprenne le fil, pas qu'il reparte à zéro.
  const { data: recentMsgs } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(10);
  const history = (recentMsgs ?? [])
    .reverse()
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content as string,
    }));

  const systemPrompt =
    buildEdenSystemPrompt(
      submission,
      profile,
      tasks,
      docContext,
      { contacts: [], opportunities: [] },
      [],
      relation,
      edenNotes,
      pastSummaries,
      scoreHistory,
      program
    ) + CHECKIN_INSTRUCTION;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (obj: unknown) => controller.enqueue(sseLine(obj));
      let text = "";

      try {
        emit({ type: "meta", conversationId });

        const openaiRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              stream: true,
              max_completion_tokens: 500,
              messages: [
                { role: "system", content: systemPrompt },
                ...history,
              ],
            }),
          }
        );

        if (!openaiRes.ok || !openaiRes.body) {
          emit({
            type: "error",
            message: "Eden n'a pas pu ouvrir la séance.",
          });
          return;
        }

        const reader = openaiRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                text += delta;
                emit({ type: "delta", text: delta });
              }
            } catch {
              continue;
            }
          }
        }

        const finalText = text.trim();
        if (finalText) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: finalText,
          });
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId)
            .eq("user_id", user.id);
        }

        emit({ type: "done", conversationId });
      } catch {
        emit({ type: "error", message: "Une erreur est survenue." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
