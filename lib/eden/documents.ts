/**
 * Analyse de documents par Eden.
 *
 * Pipeline : téléchargement (Supabase Storage) → extraction de texte
 * (PDF via unpdf, ou texte brut) → analyse IA structurée → enrichissement
 * du dossier (faits financiers, offre, structure) et recalcul du score.
 */

import type { UpdateDossierArgs } from "./tools";

// ─────────────── Types ───────────────

export type DocumentAnalysis = {
  docType: string;
  summary: string;
  keyFindings: string[];
  confidence: "high" | "medium" | "low";
  /** Champs de dossier déduits du document (appliqués si un diagnostic existe). */
  dossierUpdate: UpdateDossierArgs;
};

export type ExtractResult =
  | { ok: true; text: string }
  | { ok: false; reason: "unsupported" | "empty" | "error" };

const MAX_TEXT = 24_000;

// ─────────────── Extraction de texte ───────────────

function isPdf(mime: string | null, name: string): boolean {
  return (
    (mime ?? "").includes("pdf") || name.toLowerCase().endsWith(".pdf")
  );
}

function isPlainText(mime: string | null, name: string): boolean {
  const m = mime ?? "";
  if (
    m.startsWith("text/") ||
    m.includes("csv") ||
    m.includes("json") ||
    m.includes("markdown")
  ) {
    return true;
  }
  return /\.(txt|csv|md|markdown|json|tsv)$/i.test(name);
}

/** Extrait le texte d'un document. Supporte PDF et fichiers texte. */
export async function extractDocumentText(
  bytes: ArrayBuffer,
  mime: string | null,
  name: string
): Promise<ExtractResult> {
  try {
    if (isPdf(mime, name)) {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(bytes));
      const { text } = await extractText(pdf, { mergePages: true });
      const clean = (Array.isArray(text) ? text.join("\n") : text)
        .replace(/\s+\n/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
      if (!clean) return { ok: false, reason: "empty" };
      return { ok: true, text: clean.slice(0, MAX_TEXT) };
    }

    if (isPlainText(mime, name)) {
      const text = new TextDecoder().decode(bytes).trim();
      if (!text) return { ok: false, reason: "empty" };
      return { ok: true, text: text.slice(0, MAX_TEXT) };
    }

    return { ok: false, reason: "unsupported" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

// ─────────────── Analyse IA ───────────────

const ANALYSIS_PROMPT = `Tu es Eden, l'assistant d'accompagnement de PME québécoises de Nedexia.
On te donne le texte d'un document d'entreprise (états financiers, plan d'affaires, contrat, fiche REQ, etc.).
Analyse-le et réponds UNIQUEMENT en JSON valide avec EXACTEMENT ces clés :

{
  "docType": "type de document en 2-4 mots (ex. États financiers, Plan d'affaires, Contrat client)",
  "summary": "résumé clair en 2 à 4 phrases, en français québécois, axé sur ce qui compte pour préparer l'entreprise",
  "keyFindings": ["3 à 5 constats concrets et utiles tirés du document"],
  "confidence": "high | medium | low",
  "dossierUpdate": {
    "formeJuridique": "si le document l'indique, sinon omettre",
    "anneeCreation": "année 4 chiffres si présente, sinon omettre",
    "nbDirigeants": "nombre si présent, sinon omettre",
    "offre": "ce que vend l'entreprise en une phrase, si déductible, sinon omettre",
    "publicCible": "clientèle visée si déductible, sinon omettre",
    "finVisibilite": "1, 2 ou 3 — UNIQUEMENT pour des états financiers : 3 = marge nette claire et chiffrée, 2 = approximative, 1 = floue/absente",
    "finDependanceClient": "1, 2 ou 3 — UNIQUEMENT si le document révèle la répartition clients : 3 = diversifiée, 2 = un client important, 1 = très concentrée",
    "finTendance": "1, 2 ou 3 — UNIQUEMENT pour des états financiers pluriannuels : 3 = croissance, 2 = stable, 1 = baisse/irrégulier"
  }
}

RÈGLES STRICTES :
- N'inclus dans "dossierUpdate" QUE les champs réellement étayés par le document. Omets tout le reste — ne devine pas.
- Les champs finVisibilite/finDependanceClient/finTendance ne s'appliquent qu'à des documents financiers réels. Sinon, omets-les.
- Si le document est illisible ou hors sujet, mets confidence = "low", un summary honnête, et un dossierUpdate vide {}.`;

type RawAnalysis = {
  docType?: string;
  summary?: string;
  keyFindings?: unknown;
  confidence?: string;
  dossierUpdate?: Record<string, unknown>;
};

function asScale(v: unknown): 1 | 2 | 3 | undefined {
  const n = typeof v === "string" ? Number(v) : v;
  return n === 1 || n === 2 || n === 3 ? (n as 1 | 2 | 3) : undefined;
}

function sanitizeDossierUpdate(raw: Record<string, unknown> = {}): UpdateDossierArgs {
  const out: UpdateDossierArgs = {};
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : undefined;

  const fj = str(raw.formeJuridique);
  const ac = str(raw.anneeCreation);
  const nd = str(raw.nbDirigeants);
  const offre = str(raw.offre);
  const pc = str(raw.publicCible);
  if (fj) out.formeJuridique = fj;
  if (ac) out.anneeCreation = ac;
  if (nd) out.nbDirigeants = nd;
  if (offre) out.offre = offre;
  if (pc) out.publicCible = pc;

  const v = asScale(raw.finVisibilite);
  const d = asScale(raw.finDependanceClient);
  const t = asScale(raw.finTendance);
  if (v) out.finVisibilite = v;
  if (d) out.finDependanceClient = d;
  if (t) out.finTendance = t;

  return out;
}

/** Analyse le texte d'un document via l'IA et renvoie une structure exploitable. */
export async function analyzeDocumentText(
  apiKey: string,
  model: string,
  doc: { name: string; text: string }
): Promise<DocumentAnalysis | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          {
            role: "user",
            content: `Nom du fichier : ${doc.name}\n\nContenu :\n${doc.text}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as RawAnalysis;

    const keyFindings = Array.isArray(parsed.keyFindings)
      ? parsed.keyFindings
          .filter((x): x is string => typeof x === "string" && x.trim() !== "")
          .slice(0, 6)
      : [];

    const confidence =
      parsed.confidence === "high" || parsed.confidence === "low"
        ? parsed.confidence
        : "medium";

    return {
      docType: (parsed.docType ?? "Document").slice(0, 80),
      summary: (parsed.summary ?? "").slice(0, 1200),
      keyFindings,
      confidence,
      dossierUpdate: sanitizeDossierUpdate(parsed.dossierUpdate),
    };
  } catch {
    return null;
  }
}
