"use client";

import NumberFlow from "@number-flow/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { eden } from "./palette";

/**
 * « Orchestration » : la chaîne complète, rejouée sous les yeux du
 * visiteur — un signal détecté, une décision structurée, trois tâches
 * attribuées, puis le Score qui se recalcule (62 → 74). Eden ne
 * discute pas : il transforme l'observation en travail organisé.
 * La séquence se déclenche à l'entrée dans le viewport.
 */

const tasks = [
  {
    title: "Documenter le processus de livraison",
    dest: "Notion",
    who: "Marianne · Opérations",
    effect: "Réduit le risque de capacité",
    color: eden.sun,
  },
  {
    title: "Ouvrir le poste de coordination logistique",
    dest: "Outlook",
    who: "Direction",
    effect: "Ajoute 120 h/mois de capacité",
    color: eden.sky,
  },
  {
    title: "Décaler deux lancements hors de la pointe",
    dest: "Google Calendar",
    who: "Équipe projet",
    effect: "Lisse la charge de novembre",
    color: eden.teal,
  },
];

/** Étapes de la séquence : 0 repos · 1 signal · 2..4 tâches · 5 score. */
const STEP_MS = 900;
const LAST_STEP = tasks.length + 2;

export default function Orchestration() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStep(LAST_STEP);
      return;
    }
    if (step >= LAST_STEP) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 300 : STEP_MS);
    return () => window.clearTimeout(t);
  }, [inView, reduce, step]);

  const scoreDone = step >= LAST_STEP;

  return (
    <section className="relative border-t border-white/[0.06] bg-[#0a0c26] py-20 text-[#eef0ff] sm:py-28">
      <div className="mx-auto max-w-[96rem] px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#99ca3c]">
            Orchestration
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Eden ne discute pas. Il orchestre.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#a6abd1]">
            Un signal ne vaut rien s’il reste un signal. Quand Eden détecte
            une tension, il la découpe en tâches, les attribue aux bonnes
            personnes dans les bons outils — et mesure ce que chaque geste
            rapporte au Score.
          </p>
        </div>

        <div ref={ref} className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16">
          {/* Le signal détecté */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={step >= 1 ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative self-start border p-6 sm:p-8"
            style={{ borderColor: "rgba(249,122,69,0.4)", background: "rgba(249,122,69,0.05)" }}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-[2px]" style={{ background: eden.coral }} />
            <p className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: eden.coral }}>
              <span className="h-1 w-1 rounded-full motion-safe:animate-pulse" style={{ background: eden.coral }} />
              Tension détectée
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
              Capacité opérationnelle : 87&nbsp;%
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#a6abd1]">
              Sept ententes avancent plus vite que la planification d’équipe.
              Au rythme du pipeline, le seuil critique est atteint dans
              6 semaines — en pleine période de livraison.
            </p>
            <p className="mt-5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#565c8c]">
              Sources · HubSpot + Notion + Google Calendar
            </p>
          </motion.div>

          {/* Les tâches attribuées */}
          <div>
            <p className="border-b border-white/[0.08] pb-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#565c8c]">
              Réponse structurée — 3 tâches attribuées
            </p>
            <ul>
              {tasks.map((t, i) => {
                const on = step >= i + 2;
                return (
                  <motion.li
                    key={t.title}
                    initial={reduce ? false : { opacity: 0, x: 24 }}
                    animate={on ? { opacity: 1, x: 0 } : undefined}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 border-b border-dotted border-white/[0.09] py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <span className="font-mono text-[0.65rem]" style={{ color: t.color }}>
                      0{i + 1}
                    </span>
                    <span>
                      <span className="block text-base font-medium tracking-[-0.02em] text-[#eef0ff]">
                        {t.title}
                      </span>
                      <span className="mt-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#565c8c]">
                        → {t.dest} · {t.who}
                      </span>
                    </span>
                    <span className="col-start-2 mt-2 whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#99ca3c] sm:col-start-3 sm:mt-0">
                      {t.effect}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            {/* Le score se recalcule */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={scoreDone ? { opacity: 1 } : undefined}
              transition={{ duration: 0.6 }}
              className="mt-8 border border-[#99ca3c]/35 bg-[#99ca3c]/[0.04] p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#99ca3c]">
                    Score de préparation — projection
                  </p>
                  <p className="mt-3 flex items-baseline gap-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                    <NumberFlow value={scoreDone ? 74 : 62} locales="fr-CA" />
                    <span className="text-base font-normal text-[#a6abd1]">
                      / 100 · depuis 62
                    </span>
                  </p>
                </div>
                <Link
                  href="/score"
                  className="group whitespace-nowrap border-b border-[#eef0ff]/30 pb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#a6abd1] transition-colors hover:border-[#99ca3c] hover:text-[#99ca3c]"
                >
                  Comprendre le Score
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              <div className="relative mt-6 h-1.5 overflow-hidden bg-white/[0.08]">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-[#99ca3c]"
                  initial={{ width: "62%" }}
                  animate={{ width: scoreDone ? "74%" : "62%" }}
                  transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
                <span aria-hidden className="absolute inset-y-0 left-[62%] w-px bg-[#eef0ff]/40" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#565c8c]">
                <span>62 · aujourd’hui</span>
                <span className="text-[#99ca3c]">74 · trois actions plus tard</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
