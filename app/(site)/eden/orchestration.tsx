"use client";

import NumberFlow from "@number-flow/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { eden } from "./palette";

const tasks = [
  {
    title: "Documenter le processus de livraison",
    dest: "Notion · Marianne, Opérations",
    effect: "Réduit le risque de capacité",
    color: eden.sun,
  },
  {
    title: "Ouvrir le poste de coordination logistique",
    dest: "Outlook · Direction",
    effect: "Libère 120 heures par mois",
    color: eden.sky,
  },
  {
    title: "Décaler deux lancements hors de la pointe",
    dest: "Google Calendar · Équipe projet",
    effect: "Lisse la charge de novembre",
    color: eden.teal,
  },
];

const STEP_MS = 780;
const LAST_STEP = tasks.length + 2;

export default function Orchestration() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-22%" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || step >= LAST_STEP) return;
    const timeout = window.setTimeout(
      () => setStep((current) => (reduce ? LAST_STEP : current + 1)),
      reduce ? 0 : step === 0 ? 250 : STEP_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [inView, reduce, step]);

  const scoreDone = step >= LAST_STEP;

  return (
    <section className="relative overflow-hidden bg-[#f1f2f8] py-24 text-[#282654] sm:py-32 lg:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 45% at 4% 20%, rgba(58,55,143,0.1), transparent 70%), radial-gradient(44% 54% at 100% 72%, rgba(34,185,220,0.09), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(58,55,143,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(58,55,143,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_82%,transparent)]"
      />

      <div className="relative mx-auto max-w-[96rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-end">
          <p className="max-w-xs text-lg leading-relaxed text-[#62617d]">
            Un signal ne change rien tant qu’il ne devient pas un mouvement.
          </p>
          <h2 className="max-w-5xl text-balance text-[clamp(3.7rem,7.4vw,7.8rem)] font-semibold leading-[0.86] tracking-[-0.078em]">
            Eden ne suggère pas.
            <br />
            <span className="text-[#3a378f]">
              Il met en mouvement.
            </span>
          </h2>
        </div>

        <div
          ref={ref}
          className="relative mt-16 overflow-hidden rounded-[2.25rem] border border-[#3a378f]/12 bg-white shadow-[0_38px_110px_rgba(58,55,143,0.12)] sm:mt-20"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#3a378f,#22b9dc,transparent)] opacity-70" />

          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -28 }}
              animate={step >= 1 ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden border-b border-[#3a378f]/10 bg-[#f8f8fc] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"
            >
              <div
                aria-hidden
                className="absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(58,55,143,0.12), transparent 70%)" }}
              />
              <div className="relative">
                <p className="text-lg font-medium text-[#3a378f]">Tension détectée</p>
                <h3 className="mt-5 max-w-sm text-balance text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-5xl">
                  La demande avance plus vite que l’équipe.
                </h3>
                <p className="mt-6 max-w-md text-base leading-relaxed text-[#62617d]">
                  Sept ententes accélèrent pendant que la planification reste
                  stable. Dans six semaines, la période de livraison devient le
                  point de rupture.
                </p>
              </div>

              <div className="relative mt-12 flex items-end gap-6">
                <div
                  className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full sm:h-44 sm:w-44"
                  style={{
                    background:
                      "conic-gradient(#3a378f 0deg 313deg, rgba(58,55,143,0.1) 313deg 360deg)",
                    boxShadow: "0 0 52px rgba(58,55,143,0.1)",
                  }}
                >
                  <span className="absolute inset-[7px] rounded-full bg-white" />
                  <span className="relative text-5xl font-semibold tracking-[-0.065em] sm:text-6xl">87</span>
                  <span className="relative ml-1 self-center text-lg text-[#3a378f]">%</span>
                </div>
                <p className="pb-3 text-sm leading-relaxed text-[#8d8ca4]">
                  Capacité opérationnelle
                  <br />
                  projetée
                </p>
              </div>
            </motion.div>

            <div className="relative p-7 sm:p-10 lg:p-12">
              <div className="flex items-end justify-between gap-6 border-b border-[#3a378f]/10 pb-8">
                <h3 className="max-w-lg text-3xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                  La réponse prend forme dans les outils de l’équipe.
                </h3>
                <motion.span
                  aria-hidden
                  initial={{ scale: 0, opacity: 0 }}
                  animate={step >= 2 ? { scale: 1, opacity: 1 } : undefined}
                  className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#22b9dc]/30 bg-[#22b9dc]/10 text-2xl text-[#3a378f] sm:flex"
                >
                  ↘
                </motion.span>
              </div>

              <ul>
                {tasks.map((task, index) => {
                  const active = step >= index + 2;
                  return (
                    <motion.li
                      key={task.title}
                      initial={reduce ? false : { opacity: 0, y: 24 }}
                      animate={active ? { opacity: 1, y: 0 } : undefined}
                      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                      className="group grid gap-4 border-b border-[#3a378f]/[0.09] py-7 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                    >
                      <span
                        className="text-3xl font-medium tracking-[-0.05em]"
                        style={{ color: task.color }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block text-lg font-medium tracking-[-0.025em] text-[#282654] sm:text-xl">
                          {task.title}
                        </span>
                        <span className="mt-2 block text-sm text-[#8d8ca4]">{task.dest}</span>
                      </span>
                      <span className="max-w-44 text-sm leading-snug text-[#247c96] sm:text-right">
                        {task.effect}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={scoreDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative border-t border-[#3a378f]/10 bg-[#3a378f] p-7 text-white sm:p-10 lg:p-12"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:48px_48px]"
            />
            <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="max-w-xl text-2xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-3xl">
                  Chaque geste renforce la structure — et rend la prochaine
                  décision plus facile.
                </p>
                <Link
                  href="/score"
                  className="group mt-7 inline-flex items-center gap-3 border-b border-white/35 pb-1.5 text-sm font-semibold transition-colors hover:border-white"
                >
                  Comprendre le Score
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-medium text-white/45 line-through decoration-1">62</span>
                <span className="text-7xl font-semibold leading-none tracking-[-0.075em] sm:text-9xl">
                  <NumberFlow value={scoreDone ? 74 : 62} locales="fr-CA" />
                </span>
                <span className="text-xl font-medium">/100</span>
              </div>
            </div>
            <div className="relative mt-9 h-2 overflow-hidden rounded-full bg-white/15">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-[#22b9dc]"
                initial={{ width: "62%" }}
                animate={{ width: scoreDone ? "74%" : "62%" }}
                transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
