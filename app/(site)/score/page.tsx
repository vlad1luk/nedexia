import type { Metadata } from "next";

import { LedgerLink } from "../components/ledger-link";
import Reveal from "../components/reveal";
import { fraunces } from "../financement/fonts";

export const metadata: Metadata = {
  title: "Score — La préparation, mesurée | Nedexia",
  description:
    "Le Score Nedexia résume la préparation de votre entreprise en un chiffre sur 100 : cinq dimensions pondérées, une lecture honnête, un score qui se précise à mesure que vous travaillez avec Eden. À 70, l’accès au matchmaking s’ouvre.",
};

/**
 * /score — la mesure du jardin.
 *
 * Même système « carnet de terrain » que /financement, /eden et /matching
 * (parchemin / encre / mousse / rouille / laiton + Fraunces). Vocabulaire
 * non négociable : « préparation », jamais « maturité ». Le contenu vient
 * du vrai moteur de calcul (lib/espace/score.ts, spec Jérôme mai 2026) :
 * dimensions, pondérations, paliers, points d'élan — rien d'inventé.
 * Élément signature : la règle graduée 0-100 avec le seuil 70.
 */

const DIMENSIONS = [
  {
    label: "Santé financière",
    poids: 25,
    description:
      "Marges, liquidités, états à jour — la capacité de tenir, d’investir et de se financer.",
  },
  {
    label: "Indépendance",
    poids: 25,
    description:
      "Ce qui se passe si vous partez trois semaines. Une entreprise prête tient debout sans son fondateur.",
  },
  {
    label: "Structure juridique",
    poids: 20,
    description:
      "Conventions, registres, rôles clairs — ce qui rend l’entreprise lisible pour un tiers.",
  },
  {
    label: "Clarté stratégique",
    poids: 15,
    description:
      "Votre offre, votre message, vos priorités — compréhensibles en dix minutes par quelqu’un d’externe.",
  },
  {
    label: "Réputation",
    poids: 15,
    description:
      "Références, présence, traces publiques — ce que le marché dit de vous quand vous n’êtes pas là.",
  },
] as const;

/* Profil illustratif de la fiche spécimen — cohérent avec la pondération :
   25×78 + 25×71 + 20×68 + 15×82 + 15×74 = 74,25 → 74. */
const FICHE = [
  { label: "Santé financière", valeur: 78 },
  { label: "Indépendance", valeur: 71 },
  { label: "Structure juridique", valeur: 68 },
  { label: "Clarté stratégique", valeur: 82 },
  { label: "Réputation", valeur: 74 },
] as const;

/* Paliers de lecture — bornes et libellés de lib/espace (tierFromScore,
   TIER_LABELS). */
const PALIERS = [
  {
    plage: "0 – 30",
    nom: "À structurer",
    couleur: "bg-rust",
    texte:
      "Plusieurs fondations à consolider. C’est le point de départ le plus fréquent — et exactement ce qu’Eden sait travailler.",
  },
  {
    plage: "31 – 55",
    nom: "En progression",
    couleur: "bg-rust/50",
    texte:
      "Bonne base, zones à renforcer. Le plan de travail se concentre sur les dimensions qui pèsent le plus.",
  },
  {
    plage: "56 – 75",
    nom: "Bien positionné",
    couleur: "bg-brass",
    texte:
      "Quelques optimisations et vous êtes prêt pour des connexions qualifiées. À 70, l’accès à Matching s’ouvre.",
  },
  {
    plage: "76 – 100",
    nom: "Référence",
    couleur: "bg-moss",
    texte:
      "L’entreprise tient debout et les chiffres parlent. Le matchmaking et les partenariats sérieux sont à portée.",
  },
] as const;

const COLLECTE = [
  {
    titre: "Le premier passage est court",
    texte:
      "Sept minutes, sans compte, sans document. Ce qui n’est pas couvert ne vous pénalise pas : la dimension est notée « à documenter », et le score s’affiche pour ce qu’il est — indicatif.",
  },
  {
    titre: "Eden collecte au fil du travail",
    texte:
      "Une tâche terminée, un document déposé, une réponse précisée : chaque échange affine le calcul. Jamais un questionnaire de deux cents questions à remplir d’un bloc.",
  },
  {
    titre: "Le travail complété compte",
    texte:
      "Les actions terminées avec Eden ajoutent des points d’élan — jusqu’à +8 — pour que le score reflète l’entreprise d’aujourd’hui, pas celle du premier jour.",
  },
] as const;

export default function ScorePage() {
  return (
    <div className={fraunces.variable}>
      {/* ── Héro ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-parchment">
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <Reveal>
            <div className="mx-auto flex w-fit items-center gap-3 border-b border-ink/15 pb-3">
              <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                N&deg;05
              </span>
              <span className="h-3 w-px bg-ink/15" />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                Score · Préparation
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-8 text-balance font-[family-name:var(--font-fraunces)] text-[2.4rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
              La préparation ne se devine pas.{" "}
              <span className="italic text-rust">Elle se mesure.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ink-soft sm:text-xl">
              Le Score Nedexia résume la préparation de votre entreprise en un
              chiffre sur 100 — cinq dimensions pondérées, une lecture honnête,
              et un chemin clair pour progresser.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
              <LedgerLink href="/espace">Commencer le diagnostic</LedgerLink>
              <a
                href="#anatomie"
                className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-ink transition-colors hover:text-rust"
              >
                Voir comment il se calcule
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

          {/* Preuve courte — registre, pas tuiles */}
          <Reveal delay={0.32}>
            <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 divide-x divide-ink/10 border-t border-ink/15 pt-5">
              <div className="flex flex-col gap-1 px-3 first:pl-0">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  7 min
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  premier passage, sans compte
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-3">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  5
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  dimensions pondérées
                </dd>
              </div>
              <div className="flex flex-col gap-1 px-3">
                <dt className="font-[family-name:var(--font-fraunces)] text-xl font-medium text-ink sm:text-2xl">
                  70
                </dt>
                <dd className="text-[0.68rem] leading-snug text-ink-soft">
                  seuil d&rsquo;accès à Matching
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Anatomie du score ────────────────────────────────── */}
      <section id="anatomie" className="scroll-mt-20 bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              Anatomie du score
            </span>
            <h2 className="mt-2 max-w-2xl text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Cinq dimensions, une pondération assumée
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Tout ne pèse pas pareil. Les finances et l’indépendance comptent
              double — parce que c’est là que les alliances, les financements et
              les transmissions se gagnent ou se perdent.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            {/* Registre des dimensions */}
            <div className="flex flex-col border-t border-ink/15">
              {DIMENSIONS.map((dim, i) => (
                <Reveal key={dim.label} delay={0.05 * i}>
                  <article className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-ink/15 py-5 sm:grid-cols-[2.5rem_1fr_auto] sm:items-baseline">
                    <span className="font-[family-name:var(--font-fraunces)] text-base italic text-brass">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-ink">
                        {dim.label}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {dim.description}
                      </p>
                    </div>
                    <span className="col-start-2 font-[family-name:var(--font-fraunces)] text-sm italic text-rust sm:col-start-3 sm:text-base">
                      ×{dim.poids}
                    </span>
                  </article>
                </Reveal>
              ))}
            </div>

            {/* Fiche spécimen — profil illustratif */}
            <Reveal delay={0.15}>
              <article className="relative -rotate-[0.8deg] border border-ink/15 bg-parchment-deep/60 p-6 shadow-[3px_4px_0_0_rgba(27,36,48,0.08)] sm:p-7">
                <span className="absolute -top-3 -right-3 grid h-14 w-14 rotate-12 place-items-center rounded-full border-2 border-brass/70 text-center text-[0.55rem] font-bold uppercase leading-tight tracking-[0.06em] text-brass">
                  Fiche
                  <br />
                  type
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Score de préparation
                </span>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-fraunces)] text-6xl font-medium leading-none text-ink">
                    74
                  </span>
                  <span className="font-[family-name:var(--font-fraunces)] text-xl italic text-ink-soft">
                    /100
                  </span>
                </p>
                <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-moss">
                  Bien positionné · Matching ouvert
                </p>

                <div className="mt-6 flex flex-col gap-3 border-t border-dotted border-ink/25 pt-5">
                  {FICHE.map((dim) => (
                    <div key={dim.label} className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-medium text-ink">
                          {dim.label}
                        </span>
                        <span className="font-[family-name:var(--font-fraunces)] text-sm text-ink-soft">
                          {dim.valeur}
                        </span>
                      </div>
                      <div className="h-[3px] w-full bg-ink/10">
                        <div
                          className="h-full bg-moss/70"
                          style={{ width: `${dim.valeur}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 font-[family-name:var(--font-fraunces)] text-xs italic text-ink-soft">
                  Profil illustratif — mécanique du score, pas une PME réelle
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── La règle graduée — page d'encre ──────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              La lecture
            </span>
            <h2 className="mt-2 max-w-2xl text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium sm:text-4xl">
              Quatre paliers, un seuil qui compte
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-parchment/70">
              Le chiffre ne juge pas — il situe. Et à 70, quelque chose change
              concrètement : l’accès au matchmaking s’ouvre.
            </p>
          </Reveal>

          {/* La règle 0-100 */}
          <Reveal delay={0.1}>
            <div className="mt-14">
              <div className="relative">
                {/* Zones */}
                <div className="flex h-2.5 w-full overflow-hidden">
                  <div className="w-[30%] bg-rust" />
                  <div className="w-[25%] bg-rust/50" />
                  <div className="w-[20%] bg-brass" />
                  <div className="w-[25%] bg-moss" />
                </div>
                {/* Graduations */}
                <div className="mt-1.5 flex justify-between">
                  {Array.from({ length: 11 }, (_, i) => (
                    <span
                      key={i}
                      className="flex w-0 flex-col items-center gap-1"
                    >
                      <span className="h-1.5 w-px bg-parchment/30" />
                      <span className="font-[family-name:var(--font-fraunces)] text-[0.62rem] text-parchment/40">
                        {i * 10}
                      </span>
                    </span>
                  ))}
                </div>
                {/* Seuil 70 */}
                <div
                  aria-hidden
                  className="absolute -top-3 bottom-6 left-[70%] w-px bg-parchment/60"
                />
                <div className="absolute -top-9 left-[70%] -translate-x-1/2">
                  <span className="whitespace-nowrap font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
                    70 — Matching s&rsquo;ouvre
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Les paliers — registre */}
          <div className="mt-12 flex flex-col border-t border-parchment/15">
            {PALIERS.map((palier, i) => (
              <Reveal key={palier.nom} delay={0.06 * i}>
                <article className="flex flex-col gap-2 border-b border-parchment/15 py-5 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="flex shrink-0 items-center gap-3 sm:w-28">
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 ${palier.couleur}`}
                    />
                    <span className="font-[family-name:var(--font-fraunces)] text-base italic text-parchment/80">
                      {palier.plage}
                    </span>
                  </span>
                  <h3 className="shrink-0 text-base font-semibold text-parchment sm:w-44">
                    {palier.nom}
                  </h3>
                  <span className="hidden flex-1 border-b border-dotted border-parchment/25 sm:block" />
                  <p className="text-sm leading-relaxed text-parchment/65 sm:max-w-sm sm:text-right">
                    {palier.texte}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collecte progressive ─────────────────────────────── */}
      <section className="bg-parchment py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
              Collecte progressive
            </span>
            <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
              Un score qui se précise. Jamais un examen.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              On ne mesure pas un jardin en une seule visite. Le Score se
              construit comme l’entreprise : progressivement, au fil du travail
              réel.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col border-t border-ink/15">
            {COLLECTE.map((item, i) => (
              <Reveal key={item.titre} delay={0.06 * i}>
                <article className="flex flex-col gap-2 border-b border-ink/15 py-6 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="shrink-0 font-[family-name:var(--font-fraunces)] text-lg italic text-brass sm:w-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="shrink-0 text-base font-semibold text-ink sm:w-64">
                    {item.titre}
                  </h3>
                  <span className="hidden flex-1 border-b border-dotted border-ink/25 sm:block" />
                  <p className="text-sm leading-relaxed text-ink-soft sm:max-w-xs sm:text-right">
                    {item.texte}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appel à l'action ─────────────────────────────────── */}
      <section className="bg-ink py-20 text-parchment sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium leading-snug sm:text-4xl">
              Sept minutes pour un premier chiffre.
              <br />
              <span className="italic text-brass">Le reste se cultive.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-parchment/70">
              Sans compte, sans document. Vous saurez où votre entreprise en
              est — et par quoi commencer.
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
