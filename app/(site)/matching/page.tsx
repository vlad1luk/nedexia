import type { Metadata } from "next";
import Link from "next/link";

import AlliancePaths from "../components/alliance-paths";
import AppShowcase from "../components/app-showcase";
import { LedgerLink } from "../components/ledger-link";
import MatchingConfidentiality from "../components/matching-confidentiality";
import MatchingHero from "../components/matching-hero";
import Reveal from "../components/reveal";
import ScrollFillText from "../components/scroll-fill-text";
import { fraunces } from "../financement/fonts";

export const metadata: Metadata = {
  title: "Matching — L’application des entreprises prêtes | Nedexia",
  description:
    "Matching, l’application mobile de Nedexia : des mises en relation entre entreprises réellement compatibles — pour s’allier, céder, acquérir ou investir. L’accès se débloque avec Eden.",
};

/**
 * /matching — la récolte du jardin Nedexia.
 *
 * Système « carnet de terrain » (comme /financement et /eden). Positionnement
 * à faire ressentir : une rencontre choisie, pas un annuaire — l’accès se
 * cultive avec Eden. Élément signature : le dossier à trois tampons
 * (révélation progressive de confidentialité). Contenu inchangé.
 */
export default function MatchingPage() {
  return (
    <div className={fraunces.variable}>
      <MatchingHero />

      {/* Manifeste — texte qui se remplit */}
      <section className="bg-parchment py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollFillText
            className="mx-auto max-w-4xl font-[family-name:var(--font-fraunces)] !font-medium text-ink"
            accentClassName="italic text-rust"
            text="Matching n’est pas un annuaire de plus. C’est la récompense du parcours — un cercle où chaque entreprise a été préparée, mesurée, puis invitée. Quand une rencontre s’y produit, les deux côtés sont prêts à conclure."
            accents={["récompense", "préparée", "mesurée", "invitée", "prêts"]}
          />
          <p className="mx-auto mt-8 max-w-4xl text-center">
            <Link
              href="/psychologie"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-ink transition-colors hover:text-rust"
            >
              Comment la compatibilité se mesure — au-delà des chiffres
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      <AppShowcase />
      <AlliancePaths />
      <MatchingConfidentiality />

      {/* CTA — page d'encre */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-snug sm:text-5xl">
              L’accès à Matching ne s’achète pas.
              <br />
              <span className="italic text-brass">Il se cultive.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-parchment/65">
              Commencez avec Eden dès aujourd’hui — votre entreprise sera prête
              quand la bonne rencontre se présentera.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="mt-9">
            <LedgerLink href="/eden" tone="light">
              Rencontrer Eden
            </LedgerLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
