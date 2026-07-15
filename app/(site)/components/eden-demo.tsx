"use client";

import Image from "next/image";
import { motion } from "motion/react";
import symbole from "@/public/symbole-eden.png";

/**
 * Feuille de travail Eden — preuve produit, pas mock SaaS pastel.
 * Cadre d'encre sur parchemin, bulles register, liste de tâches
 * numérotée au laiton.
 */

const tasks = [
  {
    label: "Rassembler les états financiers 2025",
    meta: "Fait hier",
    state: "done" as const,
  },
  {
    label: "Valider les hypothèses de ventes",
    meta: "20 min · aujourd’hui",
    state: "current" as const,
  },
  {
    label: "Chiffrer les coûts fixes 2026",
    meta: "25 min · mercredi",
    state: "todo" as const,
  },
  {
    label: "Réviser le prévisionnel complet",
    meta: "30 min · vendredi",
    state: "todo" as const,
  },
];

export default function EdenDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative border border-ink/15 bg-parchment shadow-[3px_4px_0_0_rgba(27,36,48,0.08)]"
    >
      {/* En-tête de feuille */}
      <div className="flex items-center gap-3 border-b border-ink/15 px-5 py-3.5">
        <Image src={symbole} alt="" className="h-3.5 w-auto opacity-80" />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Eden — Feuille de travail
        </span>
        <span className="ml-auto hidden font-[family-name:var(--font-fraunces)] text-xs italic text-brass sm:block">
          Semaine 14 · Structuration financière
        </span>
      </div>

      <div className="grid md:grid-cols-5">
        {/* Conversation */}
        <div className="space-y-5 p-6 md:col-span-3 md:border-r md:border-ink/15 sm:p-7">
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-ink px-4 py-3 text-sm leading-relaxed text-parchment [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]">
              Mon banquier demande un prévisionnel 12 mois pour le prêt
              d’équipement. Je n’en ai jamais monté un.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-ink/15 bg-parchment-deep/60 p-1.5">
              <Image src={symbole} alt="Eden" className="h-auto w-full" />
            </span>
            <div className="max-w-[85%] space-y-3">
              <div className="border border-ink/10 bg-parchment-deep/40 px-4 py-3 text-sm leading-relaxed text-ink">
                Vos états de 2025 suffisent comme base. Je découpe le travail
                en quatre tâches cette semaine : hypothèses de ventes, coûts
                fixes, calendrier d’investissement, puis révision finale. Le
                document suivra le format attendu par la BDC et les caisses.
              </div>
              <div className="border border-ink/10 bg-parchment-deep/40 px-4 py-3 text-sm leading-relaxed text-ink">
                Première tâche aujourd’hui, 20 minutes : valider les trois
                hypothèses de ventes que j’ai préparées à partir de vos
                données. Je vous les montre?
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-ink/15 px-4 py-2.5">
            <span className="flex-1 text-sm text-ink-soft/60">Répondre à Eden…</span>
            <span className="flex h-8 w-8 items-center justify-center bg-ink text-parchment">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>

        {/* Tâches de la semaine */}
        <div className="border-t border-ink/15 bg-parchment-deep/30 p-6 md:col-span-2 md:border-t-0 sm:p-7">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brass">
            Objectif en cours
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-medium text-ink">
            Dossier de financement
          </p>
          <div className="mt-3 h-1 overflow-hidden bg-ink/10">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "25%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-moss"
            />
          </div>
          <p className="mt-2 text-xs text-ink-soft">1 tâche sur 4 complétée</p>

          <ul className="mt-6 flex flex-col border-t border-ink/15">
            {tasks.map((task, i) => (
              <motion.li
                key={task.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.28 + i * 0.1 }}
                className={`flex items-start gap-3 border-b border-dotted border-ink/20 py-3.5 last:border-b-0 ${
                  task.state === "current" ? "bg-parchment/80" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[0.65rem] font-semibold ${
                    task.state === "done"
                      ? "border-moss bg-moss text-parchment"
                      : task.state === "current"
                        ? "border-rust text-rust"
                        : "border-ink/20 text-ink-soft"
                  }`}
                >
                  {task.state === "done" ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-medium ${
                      task.state === "done"
                        ? "text-ink-soft line-through"
                        : "text-ink"
                    }`}
                  >
                    {task.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-soft">{task.meta}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
