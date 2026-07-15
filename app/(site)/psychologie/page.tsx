import type { Metadata } from "next";
import Link from "next/link";

import { LedgerLink } from "../components/ledger-link";
import PsychologyHero from "../components/psychology-hero";
import {
  PsychologyDimensionsCarousel,
  PsychologyLayersCarousel,
} from "../components/psychology-layers";
import PsychologyReportPreview from "../components/psychology-report-preview";
import Reveal from "../components/reveal";
import ScrollFillText from "../components/scroll-fill-text";
import { StatPulse } from "../components/stat-pulse";
import { fraunces } from "../financement/fonts";

export const metadata: Metadata = {
  title: "Psychologie d’entreprise — Nedexia",
  description:
    "Pourquoi le score de compatibilité Nedexia intègre une couche psychologique — et comment elle s’inscrit dans le matching, sans jamais devenir un filtre d’exclusion.",
};

/**
 * /psychologie — carnet de terrain + tech produit.
 *
 * Signature : radar OCEAN synchronisé au carrousel des couches (Embla).
 * Dimensions exclusives en carrousel. Rapport en spécimen. Contenu inchangé.
 */
export default function PsychologiePage() {
  return (
    <div className={fraunces.variable}>
      <PsychologyHero />

      {/* ── Pourquoi ça compte ──────────────────────────────── */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
            <Reveal>
              <div className="border-t border-ink/15 pt-6">
                <p className="font-[family-name:var(--font-fraunces)] text-6xl font-medium leading-none tracking-tight text-ink sm:text-7xl">
                  <StatPulse value={50} prefix="~" suffix=" %" />
                </p>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
                  des acquisitions PME connaissent des difficultés dans les 3
                  ans suivant le closing — pour des raisons de culture, de
                  style de direction ou d’incompatibilité de vision.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
                Pourquoi ça compte
              </span>
              <ScrollFillText
                className="mt-3 font-[family-name:var(--font-fraunces)] !font-medium text-ink"
                accentClassName="italic text-rust"
                text="Une transmission échoue rarement sur les chiffres. Elle échoue sur la relation."
                accents={["chiffres.", "relation."]}
              />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Nedexia est la seule application de matchmaking B2B à
                intégrer une couche psychologique dans son score de
                compatibilité — parce que la compatibilité humaine, en
                démarche solo, n’est à peu près jamais évaluée avant qu’il ne
                soit trop tard.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Couches + radar ─────────────────────────────────── */}
      <section className="bg-parchment pb-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              Le profil psychologique
            </span>
            <h2 className="mt-2 max-w-2xl text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Trois couches, une seule lecture
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Chaque couche s’appuie sur la précédente — de la base
              scientifique jusqu’aux critères propres aux transactions
              d’affaires.
            </p>
          </Reveal>

          <PsychologyLayersCarousel />
        </div>
      </section>

      {/* ── Dimensions exclusives ───────────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              Différenciateur unique Nedexia
            </span>
            <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium sm:text-4xl">
              Les 3 dimensions exclusives
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-parchment/65">
              Là où les autres outils de matchmaking s’arrêtent — ce que
              mesure réellement la couche propriétaire de Nedexia.
            </p>
          </Reveal>

          <PsychologyDimensionsCarousel />
        </div>
      </section>

      {/* ── Rapport ─────────────────────────────────────────── */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
            <Reveal>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
                Le différenciateur clé
              </span>
              <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-tight text-ink sm:text-4xl">
                Le rapport de compatibilité — généré au like.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                Dès que deux entreprises se likent mutuellement, Nedexia
                génère automatiquement un rapport complet : zones de
                complémentarité, score pondéré, nature du rapprochement,
                risques identifiés, prochaines étapes suggérées.
              </p>
              <p className="mt-5 font-[family-name:var(--font-fraunces)] text-lg italic text-ink/70">
                Le rapport remplace le premier appel à l’aveugle.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <PsychologyReportPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Garde-fou ────────────────────────────────────────── */}
      <section className="bg-parchment pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="border-l-2 border-brass/50 pl-6">
              <p className="leading-relaxed text-ink-soft">
                <strong className="font-semibold text-ink">
                  Résultats indicatifs, jamais des verdicts.
                </strong>{" "}
                Aucun utilisateur n’est exclu d’un match sur la seule base de
                son profil psychologique — la couche humaine éclaire la
                décision, elle ne la prend jamais à votre place.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-snug sm:text-5xl">
              La compatibilité se mesure.
              <br />
              <span className="italic text-brass">La préparation se construit.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-parchment/65">
              Commencez avec Eden — votre dossier, incluant votre profil
              psychologique, se prépare en vue des bonnes rencontres.
            </p>
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
          >
            <LedgerLink href="/eden" tone="light">
              Rencontrer Eden
            </LedgerLink>
            <Link
              href="/matching"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-parchment/70 transition-colors hover:text-parchment"
            >
              Voir Matching
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
