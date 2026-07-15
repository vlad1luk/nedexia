import Link from "next/link";

import { fraunces } from "./financement/fonts";
import Hero from "./components/hero";
import { LedgerLink } from "./components/ledger-link";
import Reveal from "./components/reveal";

/**
 * Page d'accueil — même système visuel que /financement (carnet de terrain
 * naturaliste × grand livre comptable : encre, parchemin, mousse, rouille,
 * laiton, serif Fraunces). Le contenu est inchangé ; seule la mise en forme
 * suit le registre : filets d'encre, numérotation italique, aucune grille
 * icône-rond, aucune carte de verre.
 */

const modules = [
  {
    href: "/eden",
    label: "Eden",
    title: "Votre tuteur de croissance",
    description:
      "Une IA qui apprend à connaître votre entreprise, identifie ce qui freine sa croissance et vous guide, étape par étape, pour la rendre prête — comme un tuteur soutient une jeune pousse.",
  },
  {
    href: "/matching",
    label: "Matching",
    title: "Des alliances qui prennent racine",
    description:
      "Quand vous êtes prêt, Eden vous connecte à des entreprises réellement compatibles — partenaires, alliés, acheteurs ou relève. Pas un annuaire ouvert : des mises en relation choisies.",
  },
  {
    href: "/score",
    label: "Score",
    title: "Mesurez votre préparation",
    description:
      "Un score clair qui reflète la maturité de votre entreprise : finances, structure, gouvernance, relève. Suivez sa progression et sachez exactement où concentrer vos efforts.",
  },
];

const journey = [
  {
    step: "01",
    season: "Semer",
    title: "Faites le point",
    description:
      "Évaluez la maturité de votre entreprise avec le Score Nedexia et voyez clairement vos forces et vos zones à cultiver.",
  },
  {
    step: "02",
    season: "Cultiver",
    title: "Devenez prêt",
    description:
      "Eden vous accompagne semaine après semaine : structurer vos finances, solidifier votre gouvernance, préparer la suite.",
  },
  {
    step: "03",
    season: "Récolter",
    title: "Alliez-vous",
    description:
      "Le moment venu, rencontrez des entreprises compatibles pour grandir ensemble, vous allier ou transmettre en confiance.",
  },
];

const intentions = [
  {
    title: "Grandir",
    description: "Accélérer sans vous essouffler, avec un plan qui tient la route.",
  },
  {
    title: "Se structurer",
    description:
      "Passer d’une entreprise qui repose sur vous à une entreprise qui tient debout.",
  },
  {
    title: "S’allier",
    description:
      "Trouver des partenaires qui partagent vos valeurs et complètent vos forces.",
  },
  {
    title: "Transmettre",
    description:
      "Préparer la relève et passer le flambeau au bon moment, aux bonnes mains.",
  },
];

export default function Home() {
  return (
    <div className={fraunces.variable}>
      {/* ── Héro ─────────────────────────────────────────────── */}
      <Hero />

      {/* ── Les trois modules — registre ─────────────────────── */}
      <section
        id="ecosysteme"
        className="scroll-mt-20 bg-parchment py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Un écosystème, trois saisons
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Chaque outil de Nedexia joue son rôle dans la croissance de votre
              entreprise — de la première pousse à la récolte.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col border-t border-ink/15">
            {modules.map((mod, i) => (
              <Reveal key={mod.href} delay={0.06 * i}>
                <Link
                  href={mod.href}
                  className="group grid grid-cols-1 gap-3 border-b border-ink/15 py-7 transition-colors hover:bg-parchment-deep/40 sm:grid-cols-[3.5rem_10rem_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <span className="font-[family-name:var(--font-fraunces)] text-lg italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    {mod.label}
                  </span>
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink">
                      {mod.title}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {mod.description}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors group-hover:text-rust">
                    Explorer
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
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Le parcours — page d'encre ───────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium sm:text-4xl">
              De la graine à la récolte
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-parchment/70">
              On ne force pas une plante à pousser. On la prépare, on la
              cultive, et la récolte vient d’elle-même.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-10 border-t border-parchment/15 pt-10 md:grid-cols-3 md:gap-8">
            {journey.map((step, i) => (
              <Reveal key={step.step} delay={0.08 * i}>
                <div className="flex flex-col gap-3 md:border-l md:border-parchment/15 md:pl-6 md:first:border-l-0 md:first:pl-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-[family-name:var(--font-fraunces)] text-2xl italic text-brass">
                      {step.step}
                    </span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brass">
                      {step.season}
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-parchment">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-parchment/70">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quatre intentions — planche de spécimens ─────────── */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Peu importe votre saison, Eden vous accompagne
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 border-t border-l border-ink/15 sm:grid-cols-2">
            {intentions.map((intent, i) => (
              <Reveal key={intent.title}>
                <div className="flex h-full flex-col gap-2 border-r border-b border-ink/15 p-7">
                  <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink">
                    {intent.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {intent.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pas un annuaire — double page du grand livre ─────── */}
      <section className="bg-parchment pb-20 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Pas un annuaire. Un jardin.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Les annuaires B2B misent sur le volume. Nedexia mise sur la
              préparation et la compatibilité — parce qu’une alliance réussie
              se cultive avant de se conclure.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid grid-cols-1 border border-ink/15 sm:grid-cols-2">
              {/* Verso — la colonne des pertes */}
              <div className="border-b border-ink/15 p-7 sm:border-b-0 sm:border-r sm:p-8">
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-medium italic text-ink-soft">
                  L’annuaire B2B ouvert
                </h3>
                <ul className="mt-6 flex flex-col">
                  {[
                    "Des milliers de profils, aucun contexte",
                    "Des approches à froid qui restent sans réponse",
                    "Aucune préparation avant la rencontre",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-dotted border-ink/20 py-3.5 text-sm text-ink-soft last:border-b-0"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 font-[family-name:var(--font-fraunces)] text-sm italic leading-none text-rust"
                      >
                        ✗
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recto — la colonne des gains */}
              <div className="bg-parchment-deep/50 p-7 sm:p-8">
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
                  Le jardin Nedexia
                </h3>
                <ul className="mt-6 flex flex-col">
                  {[
                    "Un tuteur qui vous rend prêt avant de vous connecter",
                    "Des mises en relation choisies, au bon moment",
                    "Des entreprises réellement compatibles avec la vôtre",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-dotted border-ink/20 py-3.5 text-sm text-ink last:border-b-0"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 font-[family-name:var(--font-fraunces)] text-sm italic leading-none text-moss"
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Appel à l'action — page d'encre finale ───────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-snug sm:text-4xl">
              Votre entreprise est une graine.
              <br />
              Donnez-lui un jardin.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-parchment/70">
              Commencez par une conversation avec Eden — quelques minutes
              suffisent pour semer la suite.
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
