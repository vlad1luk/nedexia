"use client";

import { useState } from "react";

import { EdenBubble } from "./eden-bubble";
import { TunnelLayout } from "./tunnel-layout";
import type { SiteFallback } from "@/lib/espace/types";

type Props = {
  initialUrl?: string;
  initialFallback?: SiteFallback;
  onBack: () => void;
  onContinue: (data: {
    siteUrl?: string;
    siteFallback?: SiteFallback;
    siteSkipped?: boolean;
  }) => void;
};

type Mode = "url" | "fallback" | null;

const INPUT_CLASS =
  "w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy placeholder:text-foreground/40 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/15";

export function Screen3Site({
  initialUrl,
  initialFallback,
  onBack,
  onContinue,
}: Props) {
  const [mode, setMode] = useState<Mode>(
    initialUrl ? "url" : initialFallback ? "fallback" : null
  );
  const [url, setUrl] = useState(initialUrl ?? "");
  const [fallback, setFallback] = useState<SiteFallback>(
    initialFallback ?? { offre: "", publicCible: "" }
  );

  const urlValid = mode === "url" && url.trim().length > 4;
  const fallbackValid =
    mode === "fallback" &&
    fallback.offre.trim().length > 0 &&
    fallback.publicCible.trim().length > 0;

  const handleSubmit = () => {
    if (mode === "url" && urlValid) onContinue({ siteUrl: url.trim() });
    else if (mode === "fallback" && fallbackValid)
      onContinue({ siteFallback: fallback });
  };

  return (
    <TunnelLayout
      screen={3}
      screenLabel="Site web"
      onBack={onBack}
      onSkip={() => onContinue({ siteSkipped: true })}
    >
      <div className="flex flex-col gap-4">
        <EdenBubble eyebrow="Eden · Étape 3/5">
          Avez-vous un site web ? Collez-le ici — je pourrai le lire pour
          comprendre votre offre et compléter votre dossier.
        </EdenBubble>

        <div
          className={`rounded-2xl border p-4 transition ${
            mode === "url" ? "border-teal/40 bg-teal/5" : "border-navy/10 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
              J&rsquo;ai un site web
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
            <input
              type="url"
              placeholder="https://votreentreprise.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`mt-3 ${INPUT_CLASS}`}
            />
          ) : null}
        </div>

        <div
          className={`rounded-2xl border p-4 transition ${
            mode === "fallback"
              ? "border-teal/40 bg-teal/5"
              : "border-navy/10 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-foreground/55">
              Je n&rsquo;ai pas de site — réponds en 2 questions
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
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground/55">
                En une phrase, que vendez-vous ?
                <input
                  type="text"
                  placeholder="ex. Service-conseil en logistique pour PME manufacturières"
                  value={fallback.offre}
                  onChange={(e) =>
                    setFallback({ ...fallback, offre: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-foreground/55">
                À qui ?
                <input
                  type="text"
                  placeholder="ex. PME manufacturières québécoises, 10 à 50 employés"
                  value={fallback.publicCible}
                  onChange={(e) =>
                    setFallback({ ...fallback, publicCible: e.target.value })
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
