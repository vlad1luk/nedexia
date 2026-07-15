"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import Reveal from "./reveal";

type Path = {
  id: string;
  num: string;
  title: string;
  teaser: string;
  description: string;
  examples: string[];
};

const paths: Path[] = [
  {
    id: "allier",
    num: "01",
    title: "S’allier",
    teaser: "Des entreprises complémentaires à la vôtre",
    description:
      "Trouvez des partenaires dont les forces prolongent les vôtres : distribution croisée, co-développement, partage de capacité, projets communs. On grandit plus vite à deux.",
    examples: ["Distribution croisée", "Co-développement", "Capacité partagée"],
  },
  {
    id: "ceder",
    num: "02",
    title: "Céder ou acquérir",
    teaser: "Transmettre, reprendre, fusionner",
    description:
      "Transmettez votre entreprise à la bonne relève, ou faites l’acquisition d’une PME déjà structurée — chiffres à jour, dossiers complets. La continuité, sans le hasard.",
    examples: ["Relève entrepreneuriale", "Acquisition stratégique", "Fusion"],
  },
  {
    id: "investir",
    num: "03",
    title: "Investir",
    teaser: "Des PME préparées, mesurées au Score",
    description:
      "Cherchez un bon pari : des PME dont la maturité se mesure au Score — pas seulement au discours. Vous investissez sur des bases documentées et vérifiables.",
    examples: ["Participation minoritaire", "Financement de croissance", "Rachat partiel"],
  },
];

/**
 * Trois intentions — accordéon horizontal en pages d'encre / parchemin.
 * Plus de dégradés colorés ; le panneau actif est une page d'encre.
 */
export default function AlliancePaths() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Une seule application, plusieurs intentions
          </span>
          <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
            Trois façons de faire alliance
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Peu importe votre intention, Matching réunit les deux côtés de la
            table — préparés, vérifiés, compatibles.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-3 lg:h-[28rem] lg:flex-row">
          {paths.map((path, i) => {
            const isActive = i === active;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-expanded={isActive}
                className={`relative min-w-0 overflow-hidden border text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? "border-ink bg-ink lg:flex-[2.8]"
                    : "border-ink/15 bg-parchment hover:border-ink/40 lg:flex-[1]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-6 right-1 select-none font-[family-name:var(--font-fraunces)] text-[8rem] font-medium leading-none italic transition-colors duration-700 ${
                    isActive ? "text-parchment/[0.06]" : "text-ink/[0.04]"
                  }`}
                >
                  {path.num}
                </span>

                <div className="relative flex h-full min-h-[8.5rem] flex-col p-6 sm:p-7">
                  <span
                    className={`font-[family-name:var(--font-fraunces)] text-sm italic tabular-nums ${
                      isActive ? "text-brass" : "text-ink/35"
                    }`}
                  >
                    {path.num}
                  </span>

                  <AnimatePresence>
                    {!isActive ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        className="mt-auto hidden lg:block"
                      >
                        <span className="block rotate-180 font-[family-name:var(--font-fraunces)] text-xl font-medium tracking-tight text-ink [writing-mode:vertical-rl]">
                          {path.title}
                        </span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  <span
                    className={`mt-4 font-[family-name:var(--font-fraunces)] text-2xl font-medium tracking-tight text-ink ${
                      isActive ? "hidden" : "lg:hidden"
                    }`}
                  >
                    {path.title}
                  </span>

                  <AnimatePresence>
                    {isActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.25, duration: 0.4, ease: "easeOut" },
                        }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                        className="mt-5 flex flex-1 flex-col lg:mt-7"
                      >
                        <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium tracking-tight text-parchment sm:text-3xl">
                          {path.title}
                        </h3>
                        <p className="mt-2 text-sm font-medium italic text-brass">
                          {path.teaser}
                        </p>
                        <p className="mt-5 max-w-md text-base leading-relaxed text-parchment/70 sm:text-lg">
                          {path.description}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-2 lg:mt-auto lg:pt-6">
                          {path.examples.map((ex) => (
                            <span
                              key={ex}
                              className="border border-parchment/20 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-parchment/80"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
