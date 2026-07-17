"use client";

import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { eden } from "./palette";

/**
 * « Journal de veille » : le flux brut de ce qu'Eden observe, en continu.
 * Les entrées remontent une à une — lectures de routine, signaux,
 * anomalies, opportunités, actions — comme un registre système vivant.
 * La recence est déduite de la position (déterministe, donc stable au
 * rendu serveur) : une entrée par tick, un tick = 5 s affichées.
 */

type Kind = "lecture" | "signal" | "anomalie" | "opportunité" | "action";

const kindColor: Record<Kind, string> = {
  lecture: eden.teal,
  signal: eden.sky,
  anomalie: eden.coral,
  opportunité: eden.leaf,
  action: eden.sun,
};

type Entry = { kind: Kind; source: string; text: string };

const entries: Entry[] = [
  {
    kind: "lecture",
    source: "QuickBooks ↔ Stripe",
    text: "214 transactions rapprochées. Aucun écart.",
  },
  {
    kind: "signal",
    source: "HubSpot",
    text: "Cycle de vente raccourci : 31 → 26 jours sur les ententes actives.",
  },
  {
    kind: "action",
    source: "→ Notion",
    text: "Tâche créée : préparer les états intermédiaires. Attribuée.",
  },
  {
    kind: "anomalie",
    source: "Shopify",
    text: "Délai moyen d’expédition en hausse de 1,8 jour depuis le 12.",
  },
  {
    kind: "opportunité",
    source: "Lecture croisée · 6 outils",
    text: "Profil conforme au volet productivité d’un programme. Fenêtre : 9 semaines.",
  },
  {
    kind: "lecture",
    source: "Google Calendar",
    text: "Charge d’équipe projetée sur 6 semaines. Capacité recalculée.",
  },
  {
    kind: "signal",
    source: "Stripe",
    text: "Encaissements 8 % au-dessus de la projection du mois.",
  },
  {
    kind: "lecture",
    source: "Mailchimp",
    text: "Campagne « relance B2B » : 42 % d’ouverture. Segments recalibrés.",
  },
  {
    kind: "anomalie",
    source: "Outlook",
    text: "3 relances fournisseur sans réponse depuis 12 jours. Suivi préparé.",
  },
  {
    kind: "opportunité",
    source: "QuickBooks",
    text: "Marge brute stable depuis 3 trimestres : critère clé d’un prêt à terme atteint.",
  },
  {
    kind: "lecture",
    source: "Salesforce",
    text: "24 occasions synchronisées. Pondération du pipeline mise à jour.",
  },
  {
    kind: "action",
    source: "→ Score",
    text: "Preuve versée au dossier : ratio de liquidité documenté. +1 point.",
  },
];

const VISIBLE = 7;
const TICK_MS = 5000;

const recency = (i: number) => (i === 0 ? "à l’instant" : `il y a ${i * 5} s`);

export default function Veille() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const running = useInView(sectionRef, { margin: "-15%" });
  const [head, setHead] = useState(0);
  const [reads, setReads] = useState(1442);

  useEffect(() => {
    if (reduce || !running) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      setHead((h) => (h + 1) % entries.length);
      setReads((r) => r + 3);
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [reduce, running]);

  const visible = Array.from(
    { length: VISIBLE },
    (_, i) => entries[(head - i + entries.length * 2) % entries.length],
  );

  return (
    <section
      ref={sectionRef}
      id="veille"
      className="relative scroll-mt-16 border-t border-white/[0.06] bg-[#0a0c26] py-20 text-[#eef0ff] sm:py-28"
    >
      <div className="mx-auto grid max-w-[96rem] gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20 lg:px-12">
        {/* Narratif */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#99ca3c]">
            Observation permanente
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Pendant que vous dirigez, Eden veille.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#a6abd1]">
            La plupart des entreprises découvrent leurs problèmes dans les
            rapports de fin de mois. Eden les voit au moment où ils se
            forment — parce qu’il ne cesse jamais de lire.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px border border-white/[0.07] bg-white/[0.07]">
            {[
              {
                label: "Lectures aujourd’hui",
                value: <NumberFlow value={reads} locales="fr-CA" />,
              },
              { label: "Sources reliées", value: "10" },
              { label: "Questions posées", value: "0" },
              { label: "Angle mort", value: "Aucun" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0c26] p-5">
                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#565c8c]">
                  {s.label}
                </dt>
                <dd className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#eef0ff]">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Journal */}
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#565c8c]">
            <span>Journal de veille</span>
            <span className="flex items-center gap-2 text-[#99ca3c]">
              <span className="h-1 w-1 rounded-full bg-[#99ca3c] motion-safe:animate-pulse" />
              En direct
            </span>
          </div>

          <ul className="relative">
            <AnimatePresence initial={false}>
              {visible.map((e, i) => {
                const color = kindColor[e.kind];
                return (
                  <motion.li
                    key={`${e.source}-${e.text}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -14 }}
                    animate={{ opacity: 1 - i * 0.09, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 border-b border-dotted border-white/[0.09] py-4 sm:grid-cols-[7.5rem_auto_minmax(0,1fr)_auto] sm:gap-x-6"
                  >
                    <span
                      className="hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] sm:block"
                      style={{ color }}
                    >
                      {e.kind}
                    </span>
                    <span className="flex items-center gap-2 sm:contents">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full sm:hidden"
                        style={{ background: color }}
                      />
                      <span className="whitespace-nowrap font-mono text-[0.6rem] tracking-[0.06em] text-[#565c8c]">
                        {e.source}
                      </span>
                    </span>
                    <span className="col-span-2 mt-1 text-sm leading-relaxed text-[#c9cdea] sm:col-span-1 sm:mt-0">
                      {e.text}
                    </span>
                    <span className="hidden whitespace-nowrap font-mono text-[0.58rem] text-[#565c8c] sm:block">
                      {recency(i)}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#565c8c]">
            Extrait du registre — les données sont illustratives.
          </p>
        </div>
      </div>
    </section>
  );
}
