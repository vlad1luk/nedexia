"use client";

import { useState } from "react";

import { LedgerCarousel } from "./ledger-carousel";
import { OceanRadar, type RadarMode } from "./ocean-radar";
import Reveal from "./reveal";

const LAYERS: {
  mode: RadarMode;
  title: string;
  tag: string;
  body: string;
  letter: string;
}[] = [
  {
    mode: "ocean",
    letter: "O",
    title: "Big Five (OCEAN)",
    tag: "Base scientifique",
    body: "Le modèle de personnalité le plus validé en psychologie — cinq traits qui prédisent durablement le comportement.",
  },
  {
    mode: "types",
    letter: "P",
    title: "16 Personalities",
    tag: "Langage commun",
    body: "Un vocabulaire que les dirigeants connaissent déjà, pour rendre le profil lisible et actionnable des deux côtés.",
  },
  {
    mode: "nedexia",
    letter: "N",
    title: "3 dimensions relationnelles",
    tag: "Propriétaires Nedexia",
    body: "Les critères spécifiques aux transactions d’affaires — construits pour prédire ce qui fait échouer une alliance.",
  },
];

/**
 * Couches du profil — carrousel Embla synchronisé au radar OCEAN.
 * L’instrument change de mode à chaque diapositive : tech produit,
 * pas une liste numérotée.
 */
export function PsychologyLayersCarousel() {
  const [index, setIndex] = useState(0);
  const current = LAYERS[index];

  return (
    <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
      <Reveal>
        <div className="mx-auto flex max-w-sm flex-col items-center border border-ink/15 bg-parchment p-6 shadow-[3px_4px_0_0_rgba(27,36,48,0.08)] sm:p-8">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Instrument de lecture
          </span>
          <OceanRadar mode={current.mode} size={260} className="mt-4" />
          <p className="mt-2 font-[family-name:var(--font-fraunces)] text-xs italic text-ink-soft">
            Profil illustratif — mécanique du score, pas une PME réelle
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <LedgerCarousel onSelect={setIndex} selectedIndex={index} options={{ loop: true }}>
          {LAYERS.map((layer) => (
            <article
              key={layer.mode}
              className="flex min-h-[16rem] flex-col justify-between border border-ink/15 bg-parchment-deep/40 p-7 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-moss">
                  {layer.tag}
                </span>
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-fraunces)] text-5xl font-medium leading-none text-ink/10"
                >
                  {layer.letter}
                </span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-ink sm:text-3xl">
                  {layer.title}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
                  {layer.body}
                </p>
              </div>
            </article>
          ))}
        </LedgerCarousel>
      </Reveal>
    </div>
  );
}

const DIMENSIONS = [
  {
    title: "Style post-acquisition",
    body: "Durée de présence souhaitée, vitesse de transition, tolérance à l’ambiguïté.",
  },
  {
    title: "Héritage et changement",
    body: "Attachement au nom, aux équipes, à la culture — et ce qu’on est prêt à en faire évoluer.",
  },
  {
    title: "Communication & décision",
    body: "Style direct ou diplomatique, analytique ou intuitif, tolérance au risque.",
  },
];

/**
 * Dimensions exclusives — carrousel horizontal (1 visible desktop, peek mobile).
 */
export function PsychologyDimensionsCarousel() {
  return (
    <div className="mt-12">
      <LedgerCarousel
        options={{ loop: true, align: "center" }}
        showDots
        showArrows
        tone="ink"
      >
        {DIMENSIONS.map((dim) => (
          <article
            key={dim.title}
            className="mx-auto max-w-xl border border-parchment/20 bg-parchment/5 p-8 sm:p-10"
          >
            <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-parchment sm:text-3xl">
              {dim.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-parchment/65">
              {dim.body}
            </p>
          </article>
        ))}
      </LedgerCarousel>
    </div>
  );
}
