"use client";

import Image from "next/image";
import { motion } from "motion/react";
import symbole from "@/public/symbole-eden.png";

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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative"
    >
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-leaf/15 via-teal/10 to-sky/15 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-2xl shadow-navy/10">
        {/* Barre de fenêtre */}
        <div className="flex items-center gap-3 border-b border-navy/10 bg-background px-5 py-3.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-coral/70" />
            <span className="h-3 w-3 rounded-full bg-sun/80" />
            <span className="h-3 w-3 rounded-full bg-leaf/80" />
          </div>
          <div className="flex items-center gap-2">
            <Image src={symbole} alt="" className="h-3.5 w-auto" />
            <span className="text-sm font-medium text-navy">Eden — Espace de travail</span>
          </div>
          <span className="ml-auto hidden text-xs text-foreground/40 sm:block">
            Semaine 14 · Structuration financière
          </span>
        </div>

        <div className="grid md:grid-cols-5">
          {/* Conversation */}
          <div className="space-y-5 p-6 md:col-span-3 md:border-r md:border-navy/5 sm:p-7">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-4 py-3 text-sm leading-relaxed text-white">
                Mon banquier demande un prévisionnel 12 mois pour le prêt
                d’équipement. Je n’en ai jamais monté un.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white p-1.5">
                <Image src={symbole} alt="Eden" className="h-auto w-full" />
              </span>
              <div className="max-w-[85%] space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-navy/5 px-4 py-3 text-sm leading-relaxed text-foreground/80">
                  Vos états de 2025 suffisent comme base. Je découpe le travail
                  en quatre tâches cette semaine : hypothèses de ventes, coûts
                  fixes, calendrier d’investissement, puis révision finale. Le
                  document suivra le format attendu par la BDC et les caisses.
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-navy/5 px-4 py-3 text-sm leading-relaxed text-foreground/80">
                  Première tâche aujourd’hui, 20 minutes : valider les trois
                  hypothèses de ventes que j’ai préparées à partir de vos
                  données. Je vous les montre?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-navy/10 px-4 py-2.5">
              <span className="flex-1 text-sm text-foreground/40">Répondre à Eden…</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>

          {/* Tâches de la semaine */}
          <div className="border-t border-navy/5 bg-background/60 p-6 md:col-span-2 md:border-t-0 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Objectif en cours
            </p>
            <p className="mt-1 font-semibold text-navy">Dossier de financement</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-leaf to-teal"
              />
            </div>
            <p className="mt-2 text-xs text-foreground/50">1 tâche sur 4 complétée</p>

            <ul className="mt-6 space-y-3">
              {tasks.map((task, i) => (
                <motion.li
                  key={task.label}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 + i * 0.12 }}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                    task.state === "current"
                      ? "border-leaf/60 bg-white shadow-sm"
                      : "border-navy/5 bg-white/60"
                  }`}
                >
                  {task.state === "done" ? (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${
                        task.state === "current" ? "border-leaf" : "border-navy/20"
                      }`}
                    />
                  )}
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium ${
                        task.state === "done"
                          ? "text-foreground/40 line-through"
                          : "text-navy"
                      }`}
                    >
                      {task.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-foreground/50">{task.meta}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
