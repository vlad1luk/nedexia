/**
 * Orchestration serveur de l'analyse d'un document.
 * Partagée par l'endpoint d'upload (/api/espace/documents/analyze) et par
 * l'outil Eden `analyze_document` du chat.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { rowToSubmission, submissionToRow } from "@/lib/espace/supabase-store";
import {
  analyzeDocumentText,
  extractDocumentText,
  type DocumentAnalysis,
} from "./documents";
import { applyDossierUpdate } from "./tools";

export type AnalyzeOutcome = {
  ok: boolean;
  status: "done" | "failed" | "unsupported";
  message: string;
  documentId: string;
  documentName?: string;
  analysis?: DocumentAnalysis;
  changed?: string[];
  scoreBefore?: number | null;
  score?: number | null;
  tier?: string | null;
};

/** Télécharge, extrait, analyse et enrichit le dossier à partir d'un document. */
export async function runDocumentAnalysis(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  apiKey: string,
  model: string
): Promise<AnalyzeOutcome> {
  const { data: doc } = await supabase
    .from("documents")
    .select("id, name, mime, storage_path, diagnostic_id")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!doc) {
    return {
      ok: false,
      status: "failed",
      message: "Document introuvable.",
      documentId,
    };
  }

  await supabase
    .from("documents")
    .update({ analysis_status: "processing" })
    .eq("id", documentId)
    .eq("user_id", userId);

  const setStatus = (status: AnalyzeOutcome["status"]) =>
    supabase
      .from("documents")
      .update({ analysis_status: status })
      .eq("id", documentId)
      .eq("user_id", userId);

  // ─── Téléchargement ───
  const { data: blob, error: dlErr } = await supabase.storage
    .from("documents")
    .download(doc.storage_path);
  if (dlErr || !blob) {
    await setStatus("failed");
    return {
      ok: false,
      status: "failed",
      message: "Téléchargement du fichier impossible.",
      documentId,
      documentName: doc.name,
    };
  }

  // ─── Extraction ───
  const bytes = await blob.arrayBuffer();
  const extracted = await extractDocumentText(bytes, doc.mime, doc.name);
  if (!extracted.ok) {
    const status = extracted.reason === "unsupported" ? "unsupported" : "failed";
    await setStatus(status);
    return {
      ok: false,
      status,
      message:
        extracted.reason === "unsupported"
          ? "Format non pris en charge pour l'analyse (PDF et fichiers texte uniquement)."
          : "Impossible d'extraire le texte de ce document.",
      documentId,
      documentName: doc.name,
    };
  }

  // ─── Analyse IA ───
  const analysis = await analyzeDocumentText(apiKey, model, {
    name: doc.name,
    text: extracted.text,
  });
  if (!analysis) {
    await setStatus("failed");
    return {
      ok: false,
      status: "failed",
      message: "L'analyse n'a pas abouti. Réessaie dans un moment.",
      documentId,
      documentName: doc.name,
    };
  }

  await supabase
    .from("documents")
    .update({
      analysis_status: "done",
      analysis,
      analyzed_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("user_id", userId);

  // ─── Enrichissement du dossier + recalcul du score ───
  let changed: string[] = [];
  let scoreBefore: number | null = null;
  let score: number | null = null;
  let tier: string | null = null;

  const hasUpdate = Object.keys(analysis.dossierUpdate).length > 0;
  if (hasUpdate) {
    const { data: diagRow } = await supabase
      .from("diagnostics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (diagRow) {
      const submission = rowToSubmission(diagRow);
      scoreBefore = submission.score?.total ?? null;
      const { submission: next, changed: ch } = applyDossierUpdate(
        submission,
        analysis.dossierUpdate
      );
      changed = ch;
      score = next.score?.total ?? null;
      tier = next.score?.tier ?? null;
      if (ch.length > 0) {
        await supabase
          .from("diagnostics")
          .update(submissionToRow(next, userId))
          .eq("id", diagRow.id)
          .eq("user_id", userId);
      }
    }
  }

  return {
    ok: true,
    status: "done",
    message: "Analyse terminée.",
    documentId,
    documentName: doc.name,
    analysis,
    changed,
    scoreBefore,
    score,
    tier,
  };
}
