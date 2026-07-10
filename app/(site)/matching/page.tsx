import type { Metadata } from "next";
import Link from "next/link";
import AlliancePaths from "../components/alliance-paths";
import AppShowcase from "../components/app-showcase";
import MatchingConfidentiality from "../components/matching-confidentiality";
import MatchingHero from "../components/matching-hero";
import Reveal from "../components/reveal";
import ScrollFillText from "../components/scroll-fill-text";

export const metadata: Metadata = {
  title: "Matching — L’application des entreprises prêtes | Nedexia",
  description:
    "Matching, l’application mobile de Nedexia : des mises en relation entre entreprises réellement compatibles — pour s’allier, céder, acquérir ou investir. L’accès se débloque avec Eden.",
};

export default function MatchingPage() {
  return (
    <>
      {/* ── Héro cinématique ─────────────────────────────────── */}
      <MatchingHero />

      {/* ── Le texte qui se remplit au défilement ────────────── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollFillText
            className="mx-auto max-w-4xl"
            text="Matching n’est pas un annuaire de plus. C’est la récompense du parcours — un cercle où chaque entreprise a été préparée, mesurée, puis invitée. Quand une rencontre s’y produit, les deux côtés sont prêts à conclure."
            accents={["récompense", "préparée", "mesurée", "invitée", "prêts"]}
          />
          <p className="mx-auto mt-8 max-w-4xl text-center">
            <Link
              href="/psychologie"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-teal transition-colors hover:text-teal/80"
            >
              Comment la compatibilité se mesure — au-delà des chiffres
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </p>
        </div>
      </section>

      {/* ── Découverte de l’application ────────────────────────── */}
      <AppShowcase />

      {/* ── Trois façons de faire alliance ───────────────────── */}
      <AlliancePaths />

      {/* ── Confidentialité 3 niveaux + NDA intégré ──────────── */}
      <MatchingConfidentiality />

      {/* ── Appel à l’action ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-deep px-8 py-20 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-teal/20 blur-[100px]" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-leaf/15 blur-3xl" />
            </div>
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-5xl">
              L’accès à Matching ne s’achète pas.
              <br />
              <span className="bg-gradient-to-r from-leaf via-teal to-sky bg-clip-text text-transparent">
                Il se cultive.
              </span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/65">
              Commencez avec Eden dès aujourd’hui — votre entreprise sera prête
              quand la bonne rencontre se présentera.
            </p>
            <div className="relative mt-9">
              <Link
                href="/eden"
                className="inline-block rounded-full bg-white px-8 py-3.5 text-base font-semibold text-navy-deep transition-all hover:-translate-y-0.5 hover:bg-leaf"
              >
                Rencontrer Eden
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
