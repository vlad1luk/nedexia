import type { Metadata } from "next";
import Image from "next/image";

import EdenDemo from "../components/eden-demo";
import { LedgerLink } from "../components/ledger-link";
import MethodBento from "../components/method-bento";
import Reveal from "../components/reveal";
import SixMonths from "../components/six-months";
import { fraunces } from "../financement/fonts";
import symbole from "@/public/symbole-eden.png";

export const metadata: Metadata = {
  title: "Eden — Le tuteur de croissance | Nedexia",
  description:
    "Eden évalue votre entreprise, bâtit un plan de structuration et vous accompagne avec des tâches quotidiennes de 15 à 30 minutes. Du travail concret, mesuré par votre Score.",
};

/**
 * /eden — tuteur de croissance.
 *
 * Même système « carnet de terrain » que /financement et l'accueil
 * (parchemin / encre / mousse / rouille / laiton + Fraunces). Contenu
 * inchangé. La page vend une mécanique produit — diagnostic → plan →
 * tâches mesurables — pas une liste de features. L'élément signature
 * est le comparateur « Six mois d'écart » (instrument avant/après).
 */

const advisors = [
  {
    title: "Votre CPA",
    description:
      "Reçoit des livres tenus et des états préparés. Ses heures servent à vous conseiller — pas à reconstruire vos chiffres.",
  },
  {
    title: "Votre banquier",
    description:
      "Reçoit un dossier de financement complet, avec ratios à jour et prévisionnel structuré. Votre demande avance plus vite.",
  },
  {
    title: "Votre avocat",
    description:
      "Travaille à partir de conventions et de registres déjà organisés. Moins d’allers-retours, moins d’heures facturées.",
  },
];

export default function EdenPage() {
  return (
    <div className={fraunces.variable}>
      {/* ── Héro ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-parchment">
        <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <Reveal>
            <div className="mx-auto flex w-fit items-center gap-3 border-b border-ink/15 pb-3">
              <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                N&deg;02
              </span>
              <span className="h-3 w-px bg-ink/15" />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                Eden · Tuteur de croissance
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Image
              src={symbole}
              alt=""
              priority
              className="mx-auto mt-8 h-12 w-auto opacity-90 sm:h-14"
            />
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="mt-6 text-balance font-[family-name:var(--font-fraunces)] text-[2.4rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
              Le tuteur qui structure votre entreprise,{" "}
              <span className="italic text-rust">une tâche à la fois.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ink-soft sm:text-xl">
              Eden commence par un diagnostic complet, bâtit votre plan de
              structuration, puis vous accompagne chaque jour avec des tâches de
              15 à 30 minutes. Du travail concret, mesuré par votre Score — pas
              des conseils génériques.
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
              <LedgerLink href="/espace">Commencer le diagnostic</LedgerLink>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-ink transition-colors hover:text-rust"
              >
                Voir Eden à l’œuvre
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                >
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            </div>
          </Reveal>

          {/* Preuve courte sous le CTA — registre, pas tuiles */}
          <Reveal delay={0.36}>
            <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 divide-x divide-ink/10 border-t border-ink/15 pt-5">
              <div className="flex flex-col gap-1 px-3 first:pl-0">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  7 min
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  diagnostic initial
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-3">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  15–30
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  minutes par tâche
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-3">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  Score
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  progression mesurée
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Démo ─────────────────────────────────────────────── */}
      <section
        id="demo"
        className="scroll-mt-20 bg-parchment px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20"
      >
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              À l&rsquo;œuvre
            </span>
            <h2 className="mt-2 max-w-2xl text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Une vraie demande, un vrai plan de travail
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Votre banquier exige un prévisionnel? Eden le transforme en une
              semaine de tâches réalisables — et le document qui en sort est
              prêt à être déposé.
            </p>
          </Reveal>
          <div className="mt-12">
            <EdenDemo />
          </div>
        </div>
      </section>

      {/* ── La méthode ───────────────────────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              La méthode
            </span>
            <h2 className="mt-2 max-w-2xl text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium sm:text-4xl">
              D’abord comprendre. Ensuite bâtir.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-parchment/70">
              Eden travaille comme un bon tuteur : il ne récite pas la théorie,
              il organise le travail et s’assure que ça avance.
            </p>
          </Reveal>
          <MethodBento />
        </div>
      </section>

      {/* ── Six mois d’écart — élément signature ─────────────── */}
      <SixMonths />

      {/* ── Vos conseillers ──────────────────────────────────── */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              Partenaires professionnels
            </span>
            <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Eden ne remplace pas vos conseillers. Il prépare leur travail.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Une entreprise structurée coûte moins cher à conseiller, à
              financer et à accompagner. Vos partenaires professionnels le
              voient dès le premier dossier.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col border-t border-ink/15">
            {advisors.map((advisor, i) => (
              <Reveal key={advisor.title} delay={0.06 * i}>
                <article className="flex flex-col gap-2 border-b border-ink/15 py-6 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="shrink-0 font-[family-name:var(--font-fraunces)] text-lg italic text-brass sm:w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="shrink-0 text-base font-semibold text-ink sm:w-44">
                    {advisor.title}
                  </h3>
                  <span className="hidden flex-1 border-b border-dotted border-ink/25 sm:block" />
                  <p className="text-sm leading-relaxed text-ink-soft sm:max-w-sm sm:text-right">
                    {advisor.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appel à l’action ─────────────────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-snug sm:text-4xl">
              Le diagnostic prend sept minutes.
              <br />
              Le reste, Eden le découpe pour vous.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-parchment/70">
              Commencez par évaluer votre entreprise — vous saurez exactement où
              elle en est, et par quoi commencer.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="mt-9">
            <LedgerLink href="/espace" tone="light">
              Commencer le diagnostic
            </LedgerLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
