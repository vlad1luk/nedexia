"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tier } from "@/lib/espace/types";

export type DocItem = {
  id: string;
  name: string;
  size: number | null;
  analysisStatus: string;
  docType: string | null;
};

type Props = {
  docs: DocItem[];
  setDocs: Dispatch<SetStateAction<DocItem[]>>;
  onScore: (score: number, tier: Tier) => void;
  /** Nombre maximal de documents listés (6 par défaut, vue compacte). */
  limit?: number;
};

const ACCEPT = ".pdf,.txt,.csv,.md";
const MAX_SIZE = 15 * 1024 * 1024;

function formatSize(bytes: number | null) {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function statusChip(doc: DocItem): { label: string; cls: string } {
  switch (doc.analysisStatus) {
    case "done":
      return {
        label: doc.docType ? `Analysé · ${doc.docType}` : "Analysé par Eden",
        cls: "bg-moss/15 text-moss",
      };
    case "processing":
      return { label: "Eden lit le document…", cls: "bg-brass/15 text-brass" };
    case "failed":
      return { label: "Analyse impossible", cls: "bg-rust/10 text-rust" };
    case "unsupported":
      if (doc.name.endsWith(".md")) {
        // Livrable rédigé par Eden (généré en séance, stocké en Markdown).
        return { label: "Rédigé par Eden", cls: "bg-brass/15 text-brass" };
      }
      return { label: "Format non lu (PDF conseillé)", cls: "bg-ink/8 text-ink-soft" };
    default:
      return { label: "En attente d'analyse", cls: "bg-ink/8 text-ink-soft" };
  }
}

/**
 * Le coffre — dépôt léger de documents. Un fichier déposé est lu par Eden
 * dans la foulée : le dossier s'enrichit et le score peut monter. Pas de
 * dossiers ni d'arborescence : le strict utile.
 */
export function DocumentsDock({ docs, setDocs, onScore, limit = 6 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || busy) return;
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("Fichier trop lourd (15 Mo max).");
      return;
    }
    setBusy(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const slug =
        file.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9.]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80) || "document";
      const path = `${user.id}/${Date.now()}-${slug}`;

      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      const { data: row, error: insErr } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          name: file.name,
          size: file.size,
          mime: file.type || null,
          storage_path: path,
        })
        .select("id, name, size, analysis_status")
        .single();
      if (insErr || !row) throw insErr ?? new Error("Insertion impossible");

      const pending: DocItem = {
        id: row.id,
        name: row.name,
        size: row.size,
        analysisStatus: "processing",
        docType: null,
      };
      setDocs((prev) => [pending, ...prev]);

      // Analyse immédiate : Eden lit le document, le dossier s'enrichit.
      const res = await fetch("/api/eden/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: row.id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        analysis?: { docType?: string };
        score?: number | null;
        scoreBefore?: number | null;
        tier?: string | null;
        message?: string;
      };

      setDocs((prev) =>
        prev.map((d) =>
          d.id === row.id
            ? {
                ...d,
                analysisStatus: data.ok ? "done" : "unsupported",
                docType: data.analysis?.docType ?? null,
              }
            : d
        )
      );

      if (
        data.ok &&
        typeof data.score === "number" &&
        typeof data.scoreBefore === "number" &&
        data.score !== data.scoreBefore &&
        data.tier
      ) {
        onScore(data.score, data.tier as Tier);
      }
    } catch {
      setError("Le dépôt a échoué. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Zone de dépôt compacte */}
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group flex w-full items-center gap-3 border border-dashed px-4 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:cursor-wait ${
          dragOver
            ? "border-moss bg-moss/10"
            : "border-ink/25 bg-parchment hover:border-moss/60 hover:bg-moss/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/15 bg-parchment text-moss">
          {busy ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m17 8-5-5-5 5M12 3v12" />
            </svg>
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">
            {busy ? "Eden lit votre document…" : "Déposer un document"}
          </span>
          <span className="block text-xs text-ink-soft">
            États financiers, plan d&rsquo;affaires… PDF de préférence — Eden
            l&rsquo;analyse et enrichit votre dossier.
          </span>
        </span>
      </button>

      {error && <p className="px-1 text-xs text-rust">{error}</p>}

      {/* Documents déposés */}
      {docs.length > 0 && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {docs.slice(0, limit).map((doc) => {
              const chip = statusChip(doc);
              return (
                <motion.li
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 border border-ink/12 bg-parchment px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-ink/12 bg-parchment text-ink-soft">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {doc.name}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-ink-soft/70">
                      {formatSize(doc.size)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-[0.68rem] font-semibold ${chip.cls}`}
                  >
                    {chip.label}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
