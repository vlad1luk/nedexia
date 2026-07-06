"use client";

import Image from "next/image";
import Link from "next/link";
import symbole from "@/public/symbole-eden.png";

import { EdenBubble } from "./eden-bubble";
import {
  DIMENSION_LABELS,
  type DimensionId,
  type Intention,
  type ScoreSnapshot,
} from "@/lib/espace/types";
import { INTENTION_LECTURE } from "@/lib/espace/score";

type Props = {
  intention: Intention;
  score: ScoreSnapshot;
};

/**
 * Écran 6 — porte d'entrée. Le score est calculé mais réservé : pour le
 * découvrir, le dirigeant crée son espace (auth Supabase). La connexion
 * redirige vers /espace/bienvenue, qui enregistre le diagnostic côté serveur.
 */
export function Screen6Result({ intention, score }: Props) {
  const connexionHref = `/connexion?from=diagnostic&next=${encodeURIComponent(
    "/espace/bienvenue"
  )}`;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-14 sm:px-6">
        <Image src={symbole} alt="" className="h-14 w-auto animate-float-subtle" />
        <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-foreground/40">
          Eden · Diagnostic terminé
        </span>

        <h1 className="mt-8 text-balance text-center text-3xl font-semibold leading-tight text-navy sm:text-[2rem]">
          Votre score est prêt.
        </h1>

        {/* Jauge verrouillée */}
        <div className="relative mt-8 grid place-items-center">
          <div className="select-none" aria-hidden style={{ filter: "blur(14px)" }}>
            <div className="grid h-[200px] w-[200px] place-items-center rounded-full border-[14px] border-teal/40">
              <span className="text-[3.25rem] font-semibold text-navy">
                {score.total}
              </span>
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-navy/10 bg-white/85 px-5 py-4 text-center backdrop-blur">
              <LockIcon />
              <span className="text-sm font-medium text-navy">
                Réservé à votre espace
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-lg space-y-3">
          <EdenBubble eyebrow="Eden">
            J&apos;ai analysé vos réponses sur les 5 dimensions{" "}
            {`(${(Object.keys(DIMENSION_LABELS) as DimensionId[])
              .map((d) => DIMENSION_LABELS[d])
              .join(", ")})`}
            . Créez votre espace pour découvrir votre score, le détail par
            dimension et vos prochaines actions.
          </EdenBubble>
          <EdenBubble eyebrow="Lecture selon votre objectif">
            {INTENTION_LECTURE[intention]}
          </EdenBubble>
        </div>

        <Link
          href={connexionHref}
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
        >
          Créer mon espace et voir mon score
        </Link>

        <p className="mt-5 max-w-md text-center text-xs text-foreground/40">
          Courriel ou Google · sans mot de passe
        </p>

        <Link
          href={connexionHref}
          className="mt-4 text-xs font-medium text-foreground/55 underline-offset-4 hover:text-navy hover:underline"
        >
          J&apos;ai déjà un espace — me connecter
        </Link>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-teal"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
