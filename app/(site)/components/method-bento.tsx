"use client";

import { motion } from "motion/react";

const viewport = { once: true, margin: "-80px" } as const;

const audit = [
  { label: "Finances", value: 68, bar: "bg-leaf" },
  { label: "Opérations", value: 55, bar: "bg-teal" },
  { label: "Gouvernance", value: 41, bar: "bg-sky" },
  { label: "Relève", value: 32, bar: "bg-blossom" },
];

const priorities = [
  { rank: "Priorité 1", label: "Réduire la dépendance au dirigeant", emphasis: true },
  { rank: "Priorité 2", label: "Documenter les processus clés", emphasis: false },
  { rank: "Priorité 3", label: "Préparer le plan de relève", emphasis: false },
];

const hours = [8, 10, 12, 14, 16, 18];

function Card({
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={`flex flex-col rounded-[2rem] border border-navy/10 bg-background p-7 sm:p-8 ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export default function MethodBento() {
  return (
    <div className="mt-14 grid gap-5 md:grid-cols-5">
      {/* On fait le tour — le diagnostic prend des mesures */}
      <Card className="md:col-span-3">
        <div className="space-y-3.5">
          {audit.map((row, i) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-foreground/50">{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy/5">
                <motion.div
                  className={`h-full rounded-full ${row.bar}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${row.value}%` }}
                  viewport={viewport}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 + i * 0.12 }}
                />
              </div>
              <span className="w-7 text-right text-sm font-semibold tabular-nums text-navy">
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <h3 className="mt-auto pt-8 text-xl font-bold text-navy">On fait le tour</h3>
        <p className="mt-2 leading-relaxed text-foreground/70">
          Une première séance de 45 minutes où Eden apprend comment votre
          entreprise fonctionne réellement : les chiffres, les façons de faire,
          qui décide quoi. C’est là que votre Score de départ s’établit.
        </p>
      </Card>

      {/* Le plan, dans le bon ordre — la pile de priorités */}
      <Card className="md:col-span-2" delay={0.1}>
        <div className="space-y-2.5">
          {priorities.map((p, i) => (
            <motion.div
              key={p.rank}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 + i * 0.15 }}
              className={
                p.emphasis
                  ? "rounded-xl border border-leaf/50 bg-white p-3.5 shadow-md shadow-leaf/10"
                  : "rounded-xl border border-navy/5 bg-white/70 p-3.5"
              }
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  p.emphasis ? "text-leaf-deep" : "text-foreground/40"
                }`}
              >
                {p.rank}
              </span>
              <p
                className={`mt-0.5 text-sm font-medium ${
                  p.emphasis ? "text-navy" : "text-foreground/50"
                }`}
              >
                {p.label}
              </p>
            </motion.div>
          ))}
        </div>
        <h3 className="mt-auto pt-8 text-xl font-bold text-navy">Le plan, dans le bon ordre</h3>
        <p className="mt-2 leading-relaxed text-foreground/70">
          Eden repère ce qui vous freine le plus et le met en haut de la pile.
          Le reste attendra son tour.
        </p>
      </Card>

      {/* Un peu chaque jour — le créneau dans votre journée */}
      <Card className="md:col-span-2" delay={0.05}>
        <div className="relative mt-1 h-20">
          <span className="absolute left-[14%] top-0 text-xs font-semibold text-leaf-deep">
            20 min avec Eden
          </span>
          <div className="absolute inset-x-0 top-9 h-px bg-navy/10" aria-hidden="true" />
          {hours.map((h) => (
            <div
              key={h}
              className="absolute top-7"
              style={{ left: `${((h - 8) / 10) * 100}%` }}
              aria-hidden="true"
            >
              <span className="block h-2 w-px bg-navy/15" />
              <span className="mt-2 block -translate-x-1/2 text-[10px] tabular-nums text-foreground/40">
                {h} h
              </span>
            </div>
          ))}
          <motion.div
            className="absolute left-[14%] top-[30px] h-3.5 w-[9%] origin-left rounded-full bg-gradient-to-r from-leaf to-teal shadow-sm"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
          />
        </div>
        <h3 className="mt-auto pt-8 text-xl font-bold text-navy">Un peu chaque jour</h3>
        <p className="mt-2 leading-relaxed text-foreground/70">
          Une tâche par jour, rarement plus de 30 minutes. Le gabarit est prêt,
          le document aussi : vous ne partez jamais d’une page blanche.
        </p>
      </Card>

      {/* Des progrès qu’on peut montrer — la courbe du Score */}
      <Card className="md:col-span-3" delay={0.15}>
        <div className="relative">
          <svg viewBox="0 0 320 110" fill="none" className="w-full">
            <defs>
              <linearGradient id="method-curve" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#99ca3c" />
                <stop offset="1" stopColor="#149696" />
              </linearGradient>
            </defs>
            <motion.path
              d="M10 92 C 70 88, 110 74, 160 56 S 265 22, 310 14"
              stroke="url(#method-curve)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={viewport}
              transition={{ duration: 1.3, ease: "easeInOut", delay: 0.25 }}
            />
            <circle cx="10" cy="92" r="4" fill="#99ca3c" />
            <text x="22" y="100" fontSize="12" fontWeight="600" fill="#26265c" opacity="0.45">
              58
            </text>
            <motion.circle
              cx="310"
              cy="14"
              fill="#149696"
              initial={{ r: 0, opacity: 0 }}
              whileInView={{ r: 5, opacity: 1 }}
              viewport={viewport}
              transition={{ type: "spring", stiffness: 280, damping: 16, delay: 1.5 }}
            />
            <motion.text
              x="296"
              y="18"
              textAnchor="end"
              fontSize="15"
              fontWeight="700"
              fill="#232360"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewport}
              transition={{ duration: 0.4, delay: 1.6 }}
            >
              74
            </motion.text>
          </svg>
        </div>
        <h3 className="mt-auto pt-8 text-xl font-bold text-navy">Des progrès qu’on peut montrer</h3>
        <p className="mt-2 leading-relaxed text-foreground/70">
          Votre Score bouge quand l’entreprise bouge. Vous voyez le chemin
          parcouru — et le jour où vous rencontrez un banquier ou un acheteur,
          lui aussi.
        </p>
      </Card>
    </div>
  );
}
