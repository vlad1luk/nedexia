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
  from: string;
  to: string;
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
    from: "#149696",
    to: "#0087cb",
  },
  {
    id: "ceder",
    num: "02",
    title: "Céder ou acquérir",
    teaser: "Transmettre, reprendre, fusionner",
    description:
      "Transmettez votre entreprise à la bonne relève, ou faites l’acquisition d’une PME déjà structurée — chiffres à jour, dossiers complets. La continuité, sans le hasard.",
    examples: ["Relève entrepreneuriale", "Acquisition stratégique", "Fusion"],
    from: "#f06799",
    to: "#f26522",
  },
  {
    id: "investir",
    num: "03",
    title: "Investir",
    teaser: "Des PME préparées, mesurées au Score",
    description:
      "Cherchez un bon pari : des PME dont la maturité se mesure au Score — pas seulement au discours. Vous investissez sur des bases documentées et vérifiables.",
    examples: ["Participation minoritaire", "Financement de croissance", "Rachat partiel"],
    from: "#ffc20e",
    to: "#99ca3c",
  },
];

// Accordéon horizontal : le panneau actif s'étire et révèle son contenu,
// les autres se replient en colonnes étroites au titre vertical.
export default function AlliancePaths() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">
            Une seule application, plusieurs intentions
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Trois façons de faire alliance
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Peu importe votre intention, Matching réunit les deux côtés de la
            table — préparés, vérifiés, compatibles.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-4 lg:h-[30rem] lg:flex-row">
          {paths.map((path, i) => {
            const isActive = i === active;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-expanded={isActive}
                className={`relative min-w-0 overflow-hidden rounded-[2rem] border text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? "border-transparent bg-navy-deep lg:flex-[2.8]"
                    : "border-navy/10 bg-background hover:border-navy/30 lg:flex-[1]"
                }`}
              >
                {/* Halo coloré du panneau actif */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl transition-opacity duration-700 ${
                    isActive ? "opacity-35" : "opacity-0"
                  }`}
                  style={{ background: `radial-gradient(circle, ${path.from}, transparent 70%)` }}
                />
                {/* Numéro en filigrane */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-8 right-2 select-none text-[9rem] font-bold leading-none transition-colors duration-700 ${
                    isActive ? "text-white/[0.05]" : "text-navy/[0.04]"
                  }`}
                >
                  {path.num}
                </span>

                <div className="relative flex h-full min-h-[9rem] flex-col p-7 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold tabular-nums tracking-widest transition-colors duration-500 ${
                        isActive ? "text-white/45" : "text-navy/35"
                      }`}
                    >
                      {path.num}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${path.from}, ${path.to})` }}
                    />
                  </div>

                  {/* Colonne repliée (desktop) : titre vertical */}
                  <AnimatePresence>
                    {!isActive && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.35 } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="mt-auto hidden justify-self-end lg:block"
                      >
                        <span className="block rotate-180 text-2xl font-bold tracking-tight text-navy [writing-mode:vertical-rl]">
                          {path.title}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Titre replié (mobile) */}
                  <span
                    className={`mt-5 text-2xl font-bold tracking-tight text-navy ${
                      isActive ? "hidden" : "lg:hidden"
                    }`}
                  >
                    {path.title}
                  </span>

                  {/* Contenu déployé */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.45, ease: "easeOut" } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="mt-6 flex flex-1 flex-col lg:mt-8"
                      >
                        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          {path.title}
                        </h3>
                        <p className="mt-2 text-sm font-semibold" style={{ color: path.from }}>
                          {path.teaser}
                        </p>
                        <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                          {path.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-2.5 lg:mt-auto lg:pt-8">
                          {path.examples.map((ex) => (
                            <span
                              key={ex}
                              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
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
