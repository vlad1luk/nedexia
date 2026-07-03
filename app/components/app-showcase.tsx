"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import PhoneFrame, { ScreenPlaceholder } from "./phone-frame";

const features = [
  {
    id: "compat",
    kicker: "01 · Compatibilité",
    title: "Des profils choisis, jamais une file d’attente",
    body: "Quelques entreprises compatibles, sélectionnées selon vos intérêts, votre secteur et vos objectifs. Le volume n’a jamais fait une bonne rencontre.",
    screen: "Écran — Profils compatibles",
    accent: "#149696",
  },
  {
    id: "intentions",
    kicker: "02 · Intentions",
    title: "Vos intentions donnent le cap",
    body: "S’allier, céder, acquérir, investir : vous déclarez ce que vous cherchez, et chaque suggestion s’ajuste à votre trajectoire.",
    screen: "Écran — Vos intentions",
    accent: "#0087cb",
  },
  {
    id: "rencontre",
    kicker: "03 · Mise en relation",
    title: "La rencontre, au moment juste",
    body: "L’échange s’ouvre seulement quand les deux parties acceptent. Confidentiel, documenté, à votre rythme — jusqu’à la poignée de main.",
    screen: "Écran — Mise en relation",
    accent: "#99ca3c",
  },
] as const;

export default function AppShowcase() {
  const [active, setActive] = useState(0);
  const current = features[active];

  return (
    <section id="decouvrir" className="relative bg-white py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Liste éditoriale des fonctionnalités ───────────── */}
          <div className="border-t border-navy/10">
            {features.map((feature, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-pressed={isActive}
                  className="group relative block w-full border-b border-navy/10 py-6 text-left sm:py-7"
                >
                  {isActive && (
                    <motion.span
                      layoutId="showcase-indicator"
                      className="absolute -bottom-px left-0 top-0 w-full border-b-2"
                      style={{ borderColor: feature.accent }}
                      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                    />
                  )}
                  <div className="flex items-baseline gap-5">
                    <span
                      className="text-sm font-bold tabular-nums transition-colors duration-300"
                      style={{ color: isActive ? feature.accent : "rgba(49,49,132,0.3)" }}
                    >
                      {feature.kicker.slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xl font-bold tracking-tight transition-colors duration-300 sm:text-2xl ${
                          isActive ? "text-navy" : "text-navy/40 group-hover:text-navy/70"
                        }`}
                      >
                        {feature.title}
                      </p>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden text-base leading-relaxed text-foreground/65"
                          >
                            <span className="block pt-3">{feature.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Téléphone ──────────────────────────────────────── */}
          <div className="mx-auto w-full max-w-[16rem] sm:max-w-[18rem]">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-12 rounded-full blur-3xl transition-colors duration-500"
                style={{ backgroundColor: `${current.accent}22` }}
                aria-hidden="true"
              />
              <PhoneFrame className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <ScreenPlaceholder label={current.screen} />
                  </motion.div>
                </AnimatePresence>
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
