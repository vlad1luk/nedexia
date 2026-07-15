"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import PhoneFrame from "./phone-frame";

const features: readonly {
  id: string;
  num: string;
  title: string;
  body: string;
  screen: string;
}[] = [
  {
    id: "compat",
    num: "01",
    title: "Des profils choisis, jamais une file d’attente",
    body: "Quelques entreprises compatibles, sélectionnées selon vos intérêts, votre secteur et vos objectifs. Le volume n’a jamais fait une bonne rencontre.",
    screen: "La carte d’entreprise dans l’application",
  },
  {
    id: "rencontre",
    num: "02",
    title: "La rencontre, au moment juste",
    body: "L’échange s’ouvre seulement quand les deux parties acceptent. Confidentiel, documenté, à votre rythme — jusqu’à la poignée de main.",
    screen: "Le match entre deux entreprises",
  },
  {
    id: "messagerie",
    num: "03",
    title: "Une messagerie confidentielle",
    body: "L’échange sécurisé entre dirigeants : révélation progressive, NDA électronique intégré, et le contrôle de qui peut vous voir — et quand.",
    screen: "La conversation entre deux représentants",
  },
  {
    id: "pipeline",
    num: "04",
    title: "Du match au deal",
    body: "Chaque rapprochement est suivi : connexions, statuts, NDA signés, rapports. Rien ne se perd entre la rencontre et l’entente.",
    screen: "Le suivi des échanges entre deux entreprises",
  },
] as const;

/**
 * Découverte de l’app — registre éditorial + téléphone.
 * Écrans laissés vides (placeholder) pour insertion des captures plus tard.
 */
export default function AppShowcase() {
  const [active, setActive] = useState(0);
  const current = features[active];

  return (
    <section id="decouvrir" className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-t border-ink/15">
            {features.map((feature, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-pressed={isActive}
                  className="group relative block w-full border-b border-ink/15 py-6 text-left sm:py-7"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="showcase-indicator"
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-rust"
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    />
                  ) : null}
                  <div className="flex items-baseline gap-5">
                    <span
                      className={`font-[family-name:var(--font-fraunces)] text-lg italic tabular-nums ${
                        isActive ? "text-brass" : "text-ink/25"
                      }`}
                    >
                      {feature.num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-[family-name:var(--font-fraunces)] text-xl font-medium tracking-tight transition-colors duration-300 sm:text-2xl ${
                          isActive
                            ? "text-ink"
                            : "text-ink/40 group-hover:text-ink/70"
                        }`}
                      >
                        {feature.title}
                      </p>
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden text-base leading-relaxed text-ink-soft"
                          >
                            <span className="block pt-3">{feature.body}</span>
                          </motion.p>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mx-auto w-full max-w-[16rem] sm:max-w-[18rem] lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <PhoneFrame
                  className="relative ring-1 ring-ink/10"
                  label={current.screen}
                />
              </motion.div>
            </AnimatePresence>
            <p className="mt-4 text-center font-[family-name:var(--font-fraunces)] text-xs italic text-brass">
              {current.screen}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
