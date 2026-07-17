import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "../components/reveal";
import Comprehension from "./comprehension";
import Orchestration from "./orchestration";
import { eden } from "./palette";
import SystemHero from "./system-hero";
import Veille from "./veille";

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
 * l'intelligence se démontre par le comportement : le héro observe,
 * la veille détecte, la compréhension lit, l'orchestration agit.
 * Déroulé : héro-organisme → journal de veille → lectures → signal
 * transformé en tâches et en points de Score → appel à connecter.
 */

const connectors = [
  { name: "QuickBooks", color: eden.teal },
  { name: "HubSpot", color: eden.sky },
  { name: "Shopify", color: eden.sun },
  { name: "Stripe", color: eden.blossom },
  { name: "Google Calendar", color: eden.teal },
  { name: "Outlook", color: eden.sky },
  { name: "Mailchimp", color: eden.blossom },
  { name: "Salesforce", color: eden.sky },
  { name: "Zoho", color: eden.teal },
  { name: "Notion", color: eden.sun },
];

export default function EdenPage() {
  return (
    <div className="bg-[#0a0c26]">
      <SystemHero />
      <Veille />
      <Comprehension />
      <Orchestration />

      {/* ── Appel à connecter ────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0a0c26] py-24 text-[#eef0ff] sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(49,49,132,0.4), rgba(20,150,150,0.12) 60%, transparent)",
          }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center sm:px-8">
          <Reveal>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#99ca3c]">
              Prochaine étape
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              Vos données existent déjà.
              <br />
              Il manque le système qui les relie.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-balance text-base leading-relaxed text-[#a6abd1] sm:text-lg">
              Eden se branche sur ce que vous utilisez déjà — rien à migrer,
              rien à ressaisir. La lecture commence dès la première connexion.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <Link
              href="/financement"
              className="inline-block bg-[#99ca3c] px-8 py-4 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#0a0c26] transition-colors hover:bg-[#eef0ff]"
            >
              Connecter mon entreprise
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="mt-16 w-full">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-[#565c8c]">
              Fonctionne avec ce que vous avez déjà
            </p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {connectors.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center gap-2 text-[0.8rem] font-medium tracking-[-0.01em] text-[#a6abd1]"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
                  />
                  {c.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
