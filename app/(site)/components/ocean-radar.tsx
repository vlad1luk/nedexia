"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/**
 * Instrument signature — radar de profil.
 *
 * Pas une illustration de cerveau ni une grille de traits : un cadran
 * de mesure à 5 axes (OCEAN) ou 3 axes (dimensions Nedexia), comme un
 * sismographe relationnel. Les valeurs sont illustratives — elles montrent
 * la mécanique du score, pas le profil d’une PME réelle.
 */

export type RadarMode = "ocean" | "types" | "nedexia";

const MODES: Record<
  RadarMode,
  { axes: string[]; values: number[]; title: string }
> = {
  ocean: {
    title: "Big Five · OCEAN",
    axes: ["O", "C", "E", "A", "N"],
    // Ouverture, Conscience, Extraversion, Agréabilité, Neuroticisme (échelle inversée stable)
    values: [0.72, 0.85, 0.48, 0.64, 0.35],
  },
  types: {
    title: "16 Personalities · lecture",
    axes: ["E/I", "S/N", "T/F", "J/P", "—"],
    values: [0.6, 0.78, 0.55, 0.7, 0.15],
  },
  nedexia: {
    title: "Dimensions Nedexia",
    axes: ["Post-acq.", "Héritage", "Comm.", "—", "—"],
    values: [0.8, 0.94, 0.82, 0.2, 0.2],
  },
};

type Props = {
  mode: RadarMode;
  size?: number;
  className?: string;
};

function polar(cx: number, cy: number, r: number, angle: number) {
  // angle 0 = top
  const a = angle - Math.PI / 2;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function OceanRadar({ mode, size = 280, className }: Props) {
  const spec = MODES[mode];
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 36;
  const n = 5;

  const rings = [0.25, 0.5, 0.75, 1];

  const polygon = useMemo(() => {
    return spec.values
      .map((v, i) => {
        const p = polar(cx, cy, maxR * v, (i / n) * Math.PI * 2);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  }, [spec.values, cx, cy, maxR]);

  const r2 = (n: number) => Math.round(n * 100) / 100;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible" aria-hidden>
        {/* Graduations */}
        {rings.map((t) => (
          <polygon
            key={t}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.12}
            strokeWidth={1}
            points={Array.from({ length: n })
              .map((_, i) => {
                const p = polar(cx, cy, maxR * t, (i / n) * Math.PI * 2);
                return `${r2(p.x)},${r2(p.y)}`;
              })
              .join(" ")}
          />
        ))}

        {/* Axes */}
        {Array.from({ length: n }).map((_, i) => {
          const p = polar(cx, cy, maxR, (i / n) * Math.PI * 2);
          const label = polar(cx, cy, maxR + 18, (i / n) * Math.PI * 2);
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={r2(p.x)}
                y2={r2(p.y)}
                stroke="var(--color-brass)"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              <text
                x={r2(label.x)}
                y={r2(label.y)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--color-ink-soft)"
                fontSize="10"
                fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                letterSpacing="0.06em"
              >
                {spec.axes[i]}
              </text>
            </g>
          );
        })}

        {/* Polygone mesuré */}
        <motion.polygon
          key={mode}
          points={polygon}
          fill="var(--color-moss)"
          fillOpacity={0.18}
          stroke="var(--color-rust)"
          strokeWidth={1.6}
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Points */}
        {spec.values.map((v, i) => {
          const p = polar(cx, cy, maxR * v, (i / n) * Math.PI * 2);
          return (
            <motion.circle
              key={`${mode}-${i}`}
              cx={r2(p.x)}
              cy={r2(p.y)}
              r={3.5}
              fill="var(--color-rust)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 * i, duration: 0.3 }}
            />
          );
        })}
      </svg>
      <p className="sr-only">{spec.title}</p>
    </div>
  );
}
