"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import symbole from "@/public/symbole-eden.png";

type Props = {
  /** Écran courant (0 à 6) */
  screen: number;
  /** Libellé court de l'écran courant */
  screenLabel?: string;
  /** Affichage déclenché par "Passer cette étape" (uniquement écrans 2 et 3) */
  onSkip?: () => void;
  /** Bouton retour (sauf écran 0 et 6) */
  onBack?: () => void;
  children: ReactNode;
};

const STEPS: Array<{ id: number; label: string }> = [
  { id: 1, label: "Intention" },
  { id: 2, label: "REQ" },
  { id: 3, label: "Site" },
  { id: 4, label: "Questions" },
  { id: 5, label: "Suite" },
];

/**
 * Coquille des écrans 1 à 5 du tunnel — vit dans le chrome du site
 * (navbar + footer), avec sa propre barre de progression.
 */
export function TunnelLayout({
  screen,
  screenLabel,
  onSkip,
  onBack,
  children,
}: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-[70vh] w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        {/* Barre du haut : retour + points de progression + indicateur étape */}
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/55 transition hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            Retour
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  s.id < screen
                    ? "w-6 bg-leaf"
                    : s.id === screen
                      ? "w-8 bg-navy"
                      : "w-4 bg-navy/10"
                }`}
                aria-hidden
              />
            ))}
          </div>

          <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/55">
            {screen}/5 · {screenLabel}
          </span>
        </header>

        {/* Symbole Eden */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:mt-10">
          <Image src={symbole} alt="" className="h-12 w-auto animate-float-subtle" />
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-foreground/40">
            Eden · Diagnostic de préparation
          </span>
        </div>

        {/* Zone principale conversationnelle */}
        <main className="pt-8">{children}</main>

        {/* Pied de tunnel discret */}
        <footer className="mt-10 flex items-center justify-between gap-4 border-t border-navy/10 pt-4 text-xs text-foreground/55">
          <span>Diagnostic Nedexia · score indicatif · 5 à 7 minutes</span>
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="font-medium text-foreground/75 underline-offset-4 transition hover:text-navy hover:underline"
            >
              Passer cette étape
            </button>
          ) : null}
        </footer>
      </div>
    </section>
  );
}
