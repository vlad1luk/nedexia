"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * L'ANNEAU DE CROISSANCE — élément signature de /financement.
 *
 * Ni illustration de plante, ni jauge SaaS générique : un instrument de
 * précision (graduations en laiton, comme un sextant ou un baromètre) dont
 * les anneaux concentriques évoquent à la fois une coupe de cerne d'arbre
 * (la croissance mesurée année après année — écho aux « 10 ans d'expertise
 * terrain » d'Eden/Jérôme) et le cadran d'un instrument de mesure (la
 * précision financière). Utilisé à exactement deux endroits : le hero
 * (ambiant, décoratif) et le verdict (révélation animée du montant en son
 * centre). Le tunnel garde sa propre jauge, plus sobre — le risque visuel
 * ne se dépense qu'ici.
 */
type Props = {
  size?: number;
  rings?: number;
  animate?: boolean;
  className?: string;
  children?: ReactNode;
};

export function GrowthRing({
  size = 220,
  rings = 5,
  animate = true,
  className,
  children,
}: Props) {
  const reduce = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 20;
  const step = maxR / rings;
  const tickCount = 32;

  // Arrondi à 2 décimales : les représentations flottantes de sin/cos
  // peuvent différer d'un ULP entre le rendu serveur et client, ce qui
  // déclenche un avertissement d'hydratation sur les attributs SVG sans
  // aucune différence visuelle. L'arrondi élimine la divergence.
  const r2f = (n: number) => Math.round(n * 100) / 100;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible" aria-hidden>
        {/* Graduations circonférentielles — cadran d'instrument */}
        {Array.from({ length: tickCount }).map((_, i) => {
          const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
          const major = i % 4 === 0;
          const r1 = maxR + 6;
          const r2 = major ? maxR + 15 : maxR + 10;
          return (
            <line
              key={i}
              x1={r2f(cx + Math.cos(angle) * r1)}
              y1={r2f(cy + Math.sin(angle) * r1)}
              x2={r2f(cx + Math.cos(angle) * r2)}
              y2={r2f(cy + Math.sin(angle) * r2)}
              stroke="var(--color-brass)"
              strokeWidth={major ? 1.3 : 0.7}
              opacity={major ? 0.55 : 0.28}
            />
          );
        })}

        {/* Anneaux concentriques — cernes de croissance */}
        {Array.from({ length: rings }).map((_, i) => {
          const r = step * (i + 1) - step / 2 + 6;
          const circumference = 2 * Math.PI * r;
          const isOutermost = i === rings - 1;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={isOutermost ? "var(--color-rust)" : "var(--color-ink)"}
              strokeOpacity={isOutermost ? 0.7 : 0.13 + i * 0.035}
              strokeWidth={isOutermost ? 1.6 : 1}
              strokeDasharray={circumference}
              initial={
                animate && !reduce
                  ? { strokeDashoffset: circumference }
                  : { strokeDashoffset: 0 }
              }
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.14 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </svg>

      {children ? (
        <div className="absolute inset-0 grid place-items-center px-4 text-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
