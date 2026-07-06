import { EDEN_SYSTEM_PROMPT } from "@/lib/eden/system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.EDEN_DEMO_MODEL || "gpt-5.5";

/** Nombre de tours utilisateur autorisés dans la démo publique. */
export const DEMO_MAX_USER_MESSAGES = 5;
/** Garde-fou anti-abus : requêtes max par IP sur la fenêtre glissante. */
const IP_WINDOW_MS = 60 * 60 * 1000;
const IP_MAX_REQUESTS = 40;

type DemoRole = "user" | "assistant";
type DemoMessage = { role: DemoRole; content: string };

/**
 * Limiteur en mémoire (par instance). Protection légère contre les abus rapides ;
 * réinitialisé à froid sur chaque nouvelle instance serverless — suffisant pour
 * une démo, à compléter par un store partagé si le trafic l'exige.
 */
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  // Nettoyage opportuniste pour éviter une croissance non bornée.
  if (ipHits.size > 5000) {
    for (const [key, ts] of ipHits) {
      if (ts.every((t) => now - t >= IP_WINDOW_MS)) ipHits.delete(key);
    }
  }
  return hits.length > IP_MAX_REQUESTS;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}

const DEMO_ADDENDUM = `

# CONTEXTE — MODE DÉMO PUBLIQUE
Tu es en démonstration publique sur le site Nedexia, avec un visiteur non connecté et sans dossier ni Score. Tu n'as accès à aucune donnée d'entreprise.
- Reste fidèle à ton rôle de tuteur : pose des questions, donne une orientation concrète.
- Sois encore plus concis qu'en session complète : deux ou trois phrases, en prose, une seule orientation claire. Pas de listes.
- Tu n'as PAS d'outils ici : ne prétends pas créer de tâches, mettre à jour un dossier ou calculer un Score.
- Quand c'est pertinent, invite naturellement à aller plus loin : « Pour aller plus loin et garder une trace de votre plan, créez votre espace gratuit. » Sans insister à chaque message.`;

function sseLine(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Eden n'est pas disponible pour le moment." },
      { status: 503 }
    );
  }

  if (rateLimited(clientIp(request))) {
    return Response.json(
      {
        error:
          "Trop de messages depuis cette connexion. Réessayez plus tard ou créez votre espace gratuit.",
        code: "rate_limited",
      },
      { status: 429 }
    );
  }

  let body: { messages?: DemoMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps invalide." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: DemoMessage[] = raw
    .filter(
      (m): m is DemoMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 4000) }))
    .slice(-12);

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json(
      { error: "Aucun message à traiter." },
      { status: 400 }
    );
  }

  const userTurns = history.filter((m) => m.role === "user").length;
  if (userTurns > DEMO_MAX_USER_MESSAGES) {
    return Response.json(
      {
        error:
          "Vous avez atteint la limite de la démo. Créez votre espace gratuit pour continuer avec Eden.",
        code: "demo_limit",
      },
      { status: 429 }
    );
  }

  const messages = [
    { role: "system" as const, content: EDEN_SYSTEM_PROMPT + DEMO_ADDENDUM },
    ...history,
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (obj: unknown) => controller.enqueue(sseLine(obj));
      try {
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
              max_completion_tokens: 700,
              messages,
            }),
          }
        );

        if (!openaiRes.ok || !openaiRes.body) {
          emit({
            type: "error",
            message: "Eden n'a pas pu répondre pour le moment.",
          });
          controller.close();
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

            let json: {
              choices?: { delta?: { content?: string } }[];
            };
            try {
              json = JSON.parse(payload);
            } catch {
              continue;
            }
            const text = json.choices?.[0]?.delta?.content;
            if (text) emit({ type: "delta", text });
          }
        }

        emit({
          type: "done",
          remaining: Math.max(0, DEMO_MAX_USER_MESSAGES - userTurns),
        });
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
