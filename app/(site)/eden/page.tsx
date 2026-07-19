import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "../components/reveal";
import Croissance from "./croissance";
import { logos } from "./logos";
import Orchestration from "./orchestration";
import SystemHero from "./system-hero";

export const metadata: Metadata = {
  title: "Eden — Le système nerveux de votre entreprise | Nedexia",
  description:
    "Eden relie vos outils, lit ce qui s’y passe et fait remonter risques, opportunités et actions — avant que vous ayez à poser la question.",
};

/**
 * /eden — la couche d'intelligence de Nedexia.
 *
 * Registre « système vivant » : fond nuit (#0a0c26), accents de la
 * palette de marque, mono en étiquette. Pas de chat, pas d'avatar —
 * l'intelligence se démontre par le comportement. Déroulé en quatre
 * actes : héro-constellation (Eden relie et observe) → l'arbre et le
 * tuteur (Eden fait grandir, scène GSAP sans un chiffre) →
 * orchestration (signal → tâches → Score) → appel à connecter.
 */

const connectors = [
  "QuickBooks",
  "HubSpot",
  "Shopify",
  "Stripe",
  "Google Calendar",
  "Outlook",
  "Mailchimp",
  "Salesforce",
  "Zoho",
  "Notion",
];

export default function EdenPage() {
  return (
    <div className="bg-[#f5f5fa]">
      <SystemHero />
      <Croissance />
      <Orchestration />

      {/* ── Appel à connecter ────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#fbfbfd] py-28 text-[#282654] sm:py-36 lg:py-48">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[44%] -z-10 aspect-square w-[72rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(58,55,143,0.11), rgba(34,185,220,0.08), rgba(58,55,143,0.04), rgba(34,185,220,0.06), rgba(58,55,143,0.11))",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] -z-10 aspect-square w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3a378f]/[0.08]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] -z-10 aspect-square w-[66rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#3a378f]/[0.06]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-45 [background-image:linear-gradient(rgba(58,55,143,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(58,55,143,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_75%_at_50%_46%,black,transparent)]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#3a378f,#22b9dc,transparent)] opacity-40" />

        <div className="relative mx-auto flex max-w-[96rem] flex-col items-center px-5 text-center sm:px-8 lg:px-12">
          <Reveal>
            <h2 className="max-w-6xl text-balance text-[clamp(4rem,8.5vw,9rem)] font-semibold leading-[0.82] tracking-[-0.085em]">
              Tout est déjà là.
              <br />
              <span className="text-[#3a378f]">
                Relions-le.
              </span>
            </h2>
            <p className="mx-auto mt-9 max-w-2xl text-balance text-base leading-[1.75] text-[#62617d] sm:text-xl">
              Eden se branche à votre réalité sans la déplacer. Rien à migrer,
              rien à reconstruire — seulement une entreprise qui devient enfin
              lisible dans son ensemble.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <Link
              href="/financement"
              className="group relative isolate inline-flex overflow-hidden rounded-full bg-[#3a378f] px-8 py-4 text-sm font-semibold tracking-[-0.02em] text-white shadow-[0_16px_52px_rgba(58,55,143,0.2)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#2f2c79]"
            >
              <span className="absolute inset-0 -z-10 translate-x-[-110%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.68),transparent)] transition-transform duration-700 group-hover:translate-x-[110%]" />
              Connecter mon entreprise
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="mt-24 w-full sm:mt-28">
            <ul className="grid grid-cols-2 border-y border-[#3a378f]/12 sm:grid-cols-5">
              {connectors.map((name) => {
                const logo = logos[name];
                return (
                <li
                  key={name}
                  className="group flex min-h-28 items-center justify-center gap-3 border-b border-r border-[#3a378f]/[0.09] px-3 text-[#73728d] transition-colors duration-300 hover:bg-[#3a378f]/[0.035] hover:text-[#3a378f] sm:border-b-0"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 opacity-75 transition-all duration-300 group-hover:opacity-100 group-hover:drop-shadow-[0_0_12px_currentColor]"
                    fill={logo.hex}
                    aria-hidden
                  >
                    <path d={logo.path} />
                  </svg>
                  <span className="text-xs font-medium tracking-[-0.01em] sm:text-sm">{name}</span>
                </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
