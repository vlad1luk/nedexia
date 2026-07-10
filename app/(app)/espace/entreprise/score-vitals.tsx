"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TIER_LABELS, type Tier } from "@/lib/espace/types";

/** Teintes des paliers, calibrées pour le rail navy du cabinet. */
const TIER_STYLES: Record<Tier, string> = {
  rouge: "bg-coral/20 text-coral",
  orange: "bg-sun/20 text-sun",
  jaune: "bg-sun/15 text-sun",
  vert: "bg-leaf/20 text-leaf",
};

type Props = {
  score: { total: number; tier: Tier } | null;
  /** Trajectoire compacte du score (2 points minimum pour la tracer). */
  series: number[];
};

/**
 * Les signes vitaux du terrain, à demeure dans le rail sombre : anneau de
 * score animé + trajectoire. Le score n'est pas une note d'examen — c'est
 * l'état de préparation du sol.
 */
export function ScoreVitals({ score, series }: Props) {
  const total = score?.total ?? 0;
  const [display, setDisplay] = useState(0);
  const prevTotal = useRef(0);
  const [float, setFloat] = useState<{ id: number; delta: number } | null>(
    null
  );

  useEffect(() => {
    const from = prevTotal.current;
    const delta = total - from;
    prevTotal.current = total;
    // Le « +N » ne flotte que sur un vrai changement, pas au premier rendu.
    if (from > 0 && delta !== 0) {
      setFloat({ id: Date.now(), delta });
      const t = setTimeout(() => setFloat(null), 1800);
      const controls = animate(from, total, {
        duration: 1.3,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return () => {
        clearTimeout(t);
        controls.stop();
      };
    }
    const controls = animate(from, total, {
      duration: 1.3,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [total]);

  if (!score) {
    return (
      <p className="text-sm leading-relaxed text-white/55">
        Votre score apparaîtra après le diagnostic.
      </p>
    );
  }

  const R = 46;
  const C = 2 * Math.PI * R;
  const delta =
    series.length >= 2 ? series[series.length - 1] - series[0] : 0;

  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="score-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#99ca3c" />
              <stop offset="100%" stopColor="#ffc20e" />
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.1"
            strokeWidth="10"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="url(#score-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - score.total / 100) }}
            transition={{ duration: 1.3, ease: [0.32, 0.72, 0, 1] }}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-eden text-[2.4rem] font-semibold leading-none text-white tabular-nums">
            {display}
          </span>
          <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-white/40">
            Score / 100
          </span>
        </div>
        <AnimatePresence>
          {float && (
            <motion.span
              key={float.id}
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: -14, scale: 1 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className={`absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-bold tabular-nums ${
                float.delta > 0 ? "text-leaf" : "text-coral"
              }`}
            >
              {float.delta > 0 ? `+${float.delta}` : float.delta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLES[score.tier]}`}
      >
        {TIER_LABELS[score.tier]}
      </span>

      {series.length >= 2 && (
        <div className="flex w-full flex-col items-center gap-1">
          <Sparkline series={series} />
          <span className="text-xs text-white/45">
            {delta > 0 ? (
              <>
                <strong className="font-semibold text-leaf">
                  +{delta} points
                </strong>{" "}
                depuis le départ
              </>
            ) : delta < 0 ? (
              <>{delta} points depuis le départ</>
            ) : (
              "Score stable depuis le départ"
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const w = 150;
  const h = 34;
  const pad = 4;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const pts = series.map((v, i) => ({
    x: pad + (i * (w - pad * 2)) / Math.max(1, series.length - 1),
    y: h - pad - ((v - min) * (h - pad * 2)) / span,
  }));
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke="#99ca3c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="3" fill="#ffc20e" />
    </svg>
  );
}
