"use client";

import { useState } from "react";

import { EdenBubble } from "./eden-bubble";
import { TunnelLayout } from "./tunnel-layout";
import type { ReqFallback } from "@/lib/espace/types";

type Props = {
  initialUrl?: string;
  initialFallback?: ReqFallback;
  onBack: () => void;
  onContinue: (data: {
    reqUrl?: string;
    reqFallback?: ReqFallback;
    reqSkipped?: boolean;
  }) => void;
};

type Mode = "url" | "fallback" | null;

const INPUT_CLASS =
  "w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy placeholder:text-foreground/40 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/15";

export function Screen2Req({
  initialUrl,
  initialFallback,
  onBack,
  onContinue,
}: Props) {
  const [mode, setMode] = useState<Mode>(
    initialUrl ? "url" : initialFallback ? "fallback" : null
  );
  const [url, setUrl] = useState(initialUrl ?? "");
  const [fallback, setFallback] = useState<ReqFallback>(
    initialFallback ?? { formeJuridique: "", anneeCreation: "", nbDirigeants: "" }
  );

  const urlValid = mode === "url" && url.trim().length > 8;
  const fallbackValid =
    mode === "fallback" &&
    fallback.formeJuridique.trim().length > 0 &&
    fallback.anneeCreation.trim().length === 4 &&
    fallback.nbDirigeants.trim().length > 0;

  const handleSubmit = () => {
    if (mode === "url" && urlValid) {
      onContinue({ reqUrl: url.trim() });
    } else if (mode === "fallback" && fallbackValid) {
      onContinue({ reqFallback: fallback });
    }
  };

  const handleSkip = () => onContinue({ reqSkipped: true });

  return (
    <TunnelLayout
      screen={2}
      screenLabel="Registre des entreprises"
      onBack={onBack}
      onSkip={handleSkip}
    >
      <div className="flex flex-col gap-4">
        <EdenBubble eyebrow="Eden · Étape 2/5">
          Pour éviter de vous demander ce qui est déjà public, collez le lien
          de votre fiche au{" "}
          <strong className="font-medium text-navy">
            Registre des entreprises du Québec
          </strong>
          . Je pourrai la lire pour compléter votre dossier.
        </EdenBubble>

        {/* Option 1 — URL */}
        <div
          className={`rounded-2xl border p-4 transition ${
            mode === "url" ? "border-teal/40 bg-teal/5" : "border-navy/10 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
              J&rsquo;ai le lien REQ
            </span>
            {mode !== "url" ? (
              <button
                type="button"
                onClick={() => setMode("url")}
                className="text-xs font-medium text-teal underline-offset-4 hover:underline"
              >
                Sélectionner
              </button>
            ) : null}
          </div>

          {mode === "url" ? (
            <div className="mt-3 flex flex-col gap-2">
              <input
                type="url"
                placeholder="https://www.registreentreprises.gouv.qc.ca/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={INPUT_CLASS}
              />
              <a
                href="https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_19A_PIU_RechEnt_PC/PageRechSimple.aspx"
                target="_blank"
                rel="noreferrer"
                className="self-start text-xs font-medium text-teal underline-offset-4 hover:underline"
              >
                Trouver ma fiche sur le Registre des entreprises
              </a>
            </div>
          ) : null}
        </div>

        {/* Option 2 — Fallback 3 questions */}
        <div
          className={`rounded-2xl border p-4 transition ${
            mode === "fallback"
              ? "border-teal/40 bg-teal/5"
              : "border-navy/10 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
              Je n&rsquo;ai pas le lien — réponds en 3 questions
            </span>
            {mode !== "fallback" ? (
              <button
                type="button"
                onClick={() => setMode("fallback")}
                className="text-xs font-medium text-teal underline-offset-4 hover:underline"
              >
                Sélectionner
              </button>
            ) : null}
          </div>

          {mode === "fallback" ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground/55">
                Forme juridique
                <input
                  type="text"
                  placeholder="ex. Inc., S.E.N.C…"
                  value={fallback.formeJuridique}
                  onChange={(e) =>
                    setFallback({ ...fallback, formeJuridique: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground/55">
                Année de création
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="2014"
                  value={fallback.anneeCreation}
                  onChange={(e) =>
                    setFallback({ ...fallback, anneeCreation: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground/55">
                Nombre de dirigeants
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="1"
                  value={fallback.nbDirigeants}
                  onChange={(e) =>
                    setFallback({ ...fallback, nbDirigeants: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={
              (mode === "url" && !urlValid) ||
              (mode === "fallback" && !fallbackValid) ||
              mode === null
            }
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </div>
    </TunnelLayout>
  );
}
