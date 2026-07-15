"use client";

import { motion } from "motion/react";

/**
 * Méthode Eden — quatre registres sur fond d'encre.
 * Pas de grille icône-rond pastel : barres d'instrument, pile de
 * priorités numérotées, créneau horaire, courbe de Score en laiton/mousse.
 */

const viewport = { once: true, margin: "-80px" } as const;

const audit = [
  { label: "Finances", value: 68 },
  { label: "Opérations", value: 55 },
  { label: "Gouvernance", value: 41 },
  { label: "Relève", value: 32 },
];

const priorities = [
  { rank: "01", label: "Réduire la dépendance au dirigeant", emphasis: true },
  { rank: "02", label: "Documenter les processus clés", emphasis: false },
  { rank: "03", label: "Préparer le plan de relève", emphasis: false },
];

const hours = [8, 10, 12, 14, 16, 18];

function Pane({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      className={`flex flex-col border border-parchment/15 p-6 sm:p-7 ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export default function MethodBento() {
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-5">
      <Pane className="md:col-span-3">
        <div className="space-y-3.5">
          {audit.map((row, i) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-parchment/55">{row.label}</span>
              <div className="h-1 flex-1 overflow-hidden bg-parchment/10">
                <motion.div
                  className="h-full bg-moss-soft"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${row.value}%` }}
                  viewport={viewport}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                />
              </div>
              <span className="w-7 text-right font-[family-name:var(--font-fraunces)] text-sm tabular-nums text-parchment">
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <h3 className="mt-auto pt-8 font-[family-name:var(--font-fraunces)] text-xl font-medium text-parchment">
          On fait le tour
        </h3>
        <p className="mt-2 leading-relaxed text-parchment/65">
          Une première séance de 45 minutes où Eden apprend comment votre
          entreprise fonctionne réellement : les chiffres, les façons de faire,
          qui décide quoi. C’est là que votre Score de départ s’établit.
        </p>
      </Pane>

      <Pane className="md:col-span-2" delay={0.08}>
        <div className="flex flex-col border-t border-parchment/15">
          {priorities.map((p, i) => (
            <motion.div
              key={p.rank}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 + i * 0.12 }}
              className={`flex items-start gap-3 border-b border-dotted border-parchment/15 py-3.5 ${
                p.emphasis ? "bg-parchment/5" : ""
              }`}
            >
              <span
                className={`font-[family-name:var(--font-fraunces)] text-sm italic ${
                  p.emphasis ? "text-brass" : "text-parchment/40"
                }`}
              >
                {p.rank}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                    p.emphasis ? "text-brass" : "text-parchment/40"
                  }`}
                >
                  Priorité {i + 1}
                </span>
                <span
                  className={`mt-0.5 block text-sm font-medium ${
                    p.emphasis ? "text-parchment" : "text-parchment/55"
                  }`}
                >
                  {p.label}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
        <h3 className="mt-auto pt-8 font-[family-name:var(--font-fraunces)] text-xl font-medium text-parchment">
          Le plan, dans le bon ordre
        </h3>
        <p className="mt-2 leading-relaxed text-parchment/65">
          Eden repère ce qui vous freine le plus et le met en haut de la pile.
          Le reste attendra son tour.
        </p>
      </Pane>

      <Pane className="md:col-span-2" delay={0.05}>
        <div className="relative mt-1 h-20">
          <span className="absolute left-[14%] top-0 text-xs font-semibold text-brass">
            20 min avec Eden
          </span>
          <div className="absolute inset-x-0 top-9 h-px bg-parchment/15" aria-hidden="true" />
          {hours.map((h) => (
            <div
              key={h}
              className="absolute top-7"
              style={{ left: `${((h - 8) / 10) * 100}%` }}
              aria-hidden="true"
            >
              <span className="block h-2 w-px bg-parchment/25" />
              <span className="mt-2 block -translate-x-1/2 text-[10px] tabular-nums text-parchment/40">
                {h} h
              </span>
            </div>
          ))}
          <motion.div
            className="absolute left-[14%] top-[30px] h-2.5 w-[9%] origin-left bg-rust"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
          />
        </div>
        <h3 className="mt-auto pt-8 font-[family-name:var(--font-fraunces)] text-xl font-medium text-parchment">
          Un peu chaque jour
        </h3>
        <p className="mt-2 leading-relaxed text-parchment/65">
          Une tâche par jour, rarement plus de 30 minutes. Le gabarit est prêt,
          le document aussi : vous ne partez jamais d’une page blanche.
        </p>
      </Pane>

      <Pane className="md:col-span-3" delay={0.12}>
        <div className="relative">
          <svg viewBox="0 0 320 110" fill="none" className="w-full">
            <motion.path
              d="M10 92 C 70 88, 110 74, 160 56 S 265 22, 310 14"
              stroke="var(--color-brass)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={viewport}
              transition={{ duration: 1.3, ease: "easeInOut", delay: 0.25 }}
            />
            <circle cx="10" cy="92" r="3.5" fill="var(--color-brass)" opacity="0.5" />
            <text
              x="22"
              y="100"
              fontSize="12"
              fontFamily="var(--font-fraunces), Georgia, serif"
              fill="var(--color-parchment)"
              opacity="0.45"
            >
              58
            </text>
            <motion.circle
              cx="310"
              cy="14"
              fill="var(--color-moss-soft)"
              initial={{ r: 0, opacity: 0 }}
              whileInView={{ r: 5, opacity: 1 }}
              viewport={viewport}
              transition={{ type: "spring", stiffness: 280, damping: 16, delay: 1.5 }}
            />
            <motion.text
              x="296"
              y="18"
              textAnchor="end"
              fontSize="16"
              fontFamily="var(--font-fraunces), Georgia, serif"
              fontWeight="500"
              fill="var(--color-parchment)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewport}
              transition={{ duration: 0.4, delay: 1.6 }}
            >
              74
            </motion.text>
          </svg>
        </div>
        <h3 className="mt-auto pt-8 font-[family-name:var(--font-fraunces)] text-xl font-medium text-parchment">
          Des progrès qu’on peut montrer
        </h3>
        <p className="mt-2 leading-relaxed text-parchment/65">
          Votre Score bouge quand l’entreprise bouge. Vous voyez le chemin
          parcouru — et le jour où vous rencontrez un banquier ou un acheteur,
          lui aussi.
        </p>
      </Pane>
    </div>
  );
}
