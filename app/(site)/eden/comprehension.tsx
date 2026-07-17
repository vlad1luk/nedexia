"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { eden } from "./palette";

/**
 * « Lecture continue » : ce qu'Eden comprend une fois les outils reliés.
 * Registre terminal — étiquettes mono, valeurs qui se calent quand la
 * grille entre à l'écran, sparklines qui se tracent. Deux lectures portent
 * un état (tension / opportunité) : l'intelligence se voit dans les
 * exceptions, pas dans le décor.
 */

type Metric = {
  label: string;
  sources: string;
  value: number;
  format?: Format;
  suffix?: string;
  delta: string;
  tone: string;
  spark: number[];
  status?: { text: string; color: string };
};

const cad: Format = {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
};

const metrics: Metric[] = [
  {
    label: "Revenus récurrents",
    sources: "QuickBooks · Stripe",
    value: 148240,
    format: cad,
    delta: "+6,2 % ce trimestre",
    tone: eden.teal,
    spark: [30, 34, 32, 38, 41, 40, 46, 49, 52, 58, 61, 66],
  },
  {
    label: "Croissance",
    sources: "Stripe · Shopify",
    value: 11.4,
    format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    suffix: "%",
    delta: "acquisition en plateau depuis 11 semaines",
    tone: eden.sun,
    spark: [20, 30, 42, 55, 64, 70, 74, 76, 77, 77, 78, 78],
    status: { text: "Ralentissement observé", color: eden.sun },
  },
  {
    label: "Rétention clients",
    sources: "HubSpot · Salesforce",
    value: 91,
    suffix: "%",
    delta: "+1,8 pt depuis janvier",
    tone: eden.blossom,
    spark: [70, 72, 71, 74, 76, 75, 78, 80, 82, 83, 85, 86],
  },
  {
    label: "Trésorerie",
    sources: "QuickBooks · Zoho",
    value: 212500,
    format: cad,
    delta: "7,3 mois d’autonomie au rythme actuel",
    tone: eden.teal,
    spark: [40, 42, 45, 44, 48, 50, 49, 53, 56, 58, 60, 62],
  },
  {
    label: "Pipeline commercial",
    sources: "HubSpot",
    value: 486000,
    format: cad,
    delta: "24 occasions actives",
    tone: eden.sky,
    spark: [22, 30, 28, 40, 45, 52, 50, 61, 66, 72, 80, 88],
  },
  {
    label: "Campagnes",
    sources: "Mailchimp",
    value: 42,
    suffix: "%",
    delta: "taux d’ouverture · +4 pts",
    tone: eden.blossom,
    spark: [30, 28, 34, 36, 33, 40, 42, 41, 46, 44, 50, 52],
  },
  {
    label: "Recrutement",
    sources: "Outlook · Notion",
    value: 34,
    delta: "candidatures · 2 postes ouverts",
    tone: eden.sky,
    spark: [10, 14, 12, 20, 26, 24, 32, 38, 44, 52, 60, 72],
  },
  {
    label: "Capacité opérationnelle",
    sources: "Notion · Google Calendar",
    value: 87,
    suffix: "%",
    delta: "seuil de tension : 85 %",
    tone: eden.coral,
    spark: [55, 58, 60, 63, 66, 70, 72, 76, 79, 82, 85, 87],
    status: { text: "Tension détectée", color: eden.coral },
  },
  {
    label: "Admissibilité au financement",
    sources: "Lecture croisée — 6 outils",
    value: 3,
    delta: "programmes atteignables dès maintenant",
    tone: eden.leaf,
    spark: [0, 0, 10, 10, 25, 25, 25, 45, 45, 70, 70, 100],
    status: { text: "2 fenêtres avant décembre", color: eden.leaf },
  },
];

function Spark({ points, color }: { points: number[]; color: string }) {
  const W = 132;
  const H = 34;
  const at = (p: number, i: number) =>
    `${(i / (points.length - 1)) * W} ${H - 3 - (p / 100) * (H - 8)}`;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${at(p, i)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none" className="mt-4 h-9 w-full" aria-hidden>
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={color} opacity="0.07" />
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.85"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <motion.circle
        cx={W}
        cy={H - 3 - (points[points.length - 1] / 100) * (H - 8)}
        r="2.2"
        fill={color}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.3 }}
      />
    </svg>
  );
}

export default function Comprehension() {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-80px" });

  return (
    <section className="relative border-t border-white/[0.06] bg-[#0c0e2c] py-20 text-[#eef0ff] sm:py-28">
      <div className="mx-auto max-w-[96rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#99ca3c]">
              Lecture continue
            </p>
            <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Eden ne pose pas de questions. Il lit.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#a6abd1] lg:justify-self-end lg:pb-1">
            Dès que les outils sont reliés, Eden reconstitue de lui-même l’état
            réel de l’entreprise — et le garde à jour, sans qu’on le lui
            demande.
          </p>
        </div>

        <div className="mt-12 flex items-center justify-between border-b border-white/[0.08] pb-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#565c8c]">
          <span>9 lectures actives</span>
          <span className="flex items-center gap-2 text-[#99ca3c]">
            <span className="h-1 w-1 rounded-full bg-[#99ca3c] motion-safe:animate-pulse" />
            Mise à jour continue
          </span>
        </div>

        <div ref={gridRef} className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((m, i) => (
            <motion.article
              key={m.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.08 }}
              className="group relative border border-white/[0.07] bg-white/[0.02] p-5 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.045] sm:p-6"
            >
              {m.status ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[2px]"
                  style={{ background: m.status.color }}
                />
              ) : null}
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#6a70a0]">
                  {m.label}
                </h3>
                {m.status ? (
                  <span
                    className="flex shrink-0 items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em]"
                    style={{ color: m.status.color }}
                  >
                    <span
                      className="h-1 w-1 rounded-full motion-safe:animate-pulse"
                      style={{ background: m.status.color }}
                    />
                    {m.status.text}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 flex items-baseline gap-1.5 text-3xl font-semibold tracking-[-0.05em]">
                <NumberFlow value={inView ? m.value : 0} locales="fr-CA" format={m.format} />
                {m.suffix ? <span className="text-lg text-[#a6abd1]">{m.suffix}</span> : null}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-[#a6abd1]">{m.delta}</p>
              <Spark points={m.spark} color={m.tone} />
              <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#565c8c]">
                {m.sources}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
