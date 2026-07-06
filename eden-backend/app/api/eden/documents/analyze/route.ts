import { runDocumentAnalysis } from "@/lib/eden/analyze-document.server";
import { insertNotification } from "@/lib/espace/notification-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-5.5";

export async function POST(request: Request) {
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

  let body: { documentId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps invalide." }, { status: 400 });
  }

  const documentId = (body.documentId ?? "").trim();
  if (!documentId) {
    return Response.json({ error: "documentId manquant." }, { status: 400 });
  }

  const outcome = await runDocumentAnalysis(
    supabase,
    user.id,
    documentId,
    apiKey,
    MODEL
  );

  let notification = null;
  if (outcome.ok) {
    const delta =
      outcome.score != null && outcome.scoreBefore != null
        ? outcome.score - outcome.scoreBefore
        : 0;
    notification = await insertNotification(supabase, user.id, {
      kind: delta > 0 ? "score" : "document",
      title:
        delta > 0
          ? `Score +${delta} points`
          : "Document analysé",
      body: `${outcome.documentName ?? "Document"}${
        outcome.analysis?.docType ? ` · ${outcome.analysis.docType}` : ""
      }`,
      href: delta > 0 ? "#overview" : "#documents",
    });
  }

  return Response.json(
    { ...outcome, notification },
    { status: outcome.ok ? 200 : 422 }
  );
}
