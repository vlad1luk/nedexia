"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const rows = [
  {
    label: "États financiers",
    before: "8 mois de retard",
    after: "À jour, revus chaque mois",
    beforeDot: "bg-coral/70",
    afterDot: "bg-leaf",
  },
  {
    label: "Dépendance au dirigeant",
    before: "Tout passe par lui",
    after: "Deux relais formés",
    beforeDot: "bg-coral/70",
    afterDot: "bg-leaf",
  },
  {
    label: "Processus documentés",
    before: "2 sur 14",
    after: "12 sur 14",
    beforeDot: "bg-sun/80",
    afterDot: "bg-leaf",
  },
  {
    label: "Dossier de financement",
    before: "Inexistant",
    after: "Déposé à la BDC",
    beforeDot: "bg-coral/70",
    afterDot: "bg-teal",
  },
  {
    label: "Plan de relève",
    before: "Aucun",
    after: "Signé, échéancier 3 ans",
    beforeDot: "bg-coral/70",
    afterDot: "bg-teal",
  },
];

function Panel({ after }: { after: boolean }) {
  return (
    <div
      className={`flex h-full flex-col p-6 sm:p-8 ${
        after ? "bg-white" : "bg-[#f2f2ed]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className={`text-sm ${after ? "text-foreground/50" : "text-foreground/40"}`}>
          PME manufacturière · Montérégie
        </p>
        <p
          className={`text-sm font-bold uppercase tracking-wider ${
            after ? "text-teal" : "text-foreground/40"
          }`}
        >
          {after ? "Juillet" : "Janvier"}
        </p>
      </div>

      <ul className="mt-6 space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex min-h-10 items-center justify-between gap-4"
          >
            <span className={`text-sm ${after ? "text-foreground/60" : "text-foreground/45"}`}>
              {row.label}
            </span>
            <span
              className={`flex items-center gap-2 text-right text-sm font-medium ${
                after ? "text-navy" : "text-foreground/55"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${after ? row.afterDot : row.beforeDot}`}
                aria-hidden="true"
              />
              {after ? row.after : row.before}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="flex items-baseline justify-between">
          <span className={`text-sm font-medium ${after ? "text-foreground/60" : "text-foreground/45"}`}>
            Score de préparation
          </span>
          <span
            className={`text-3xl font-bold tabular-nums ${
              after ? "text-navy" : "text-foreground/40"
            }`}
          >
            {after ? 74 : 46}
          </span>
        </div>
        <div className={`mt-2.5 h-2 overflow-hidden rounded-full ${after ? "bg-navy/10" : "bg-navy/10"}`}>
          <div
            className={`h-full rounded-full ${
              after ? "w-[74%] bg-gradient-to-r from-leaf to-teal" : "w-[46%] bg-navy/25"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function SixMonths() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const interactedRef = useRef(false);
  const inView = useInView(containerRef, { margin: "-120px", once: true });

  // petit balayage d'introduction pour montrer que ça se glisse
  useEffect(() => {
    if (!inView || interactedRef.current) return;
    const controls = animate(50, 30, {
      duration: 0.9,
      ease: "easeInOut",
      delay: 0.5,
      onUpdate: (v) => {
        if (!interactedRef.current) setPos(v);
      },
      onComplete: () => {
        if (interactedRef.current) return;
        animate(30, 58, {
          duration: 1.1,
          ease: "easeInOut",
          onUpdate: (v) => {
            if (!interactedRef.current) setPos(v);
          },
        });
      },
    });
    return () => controls.stop();
  }, [inView]);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(94, Math.max(6, pct)));
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingRef.current) updateFromClientX(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-32 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Six mois d’écart
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            La même entreprise, avant et après Eden. Glissez pour comparer.
          </p>
        </div>

        <div
          ref={containerRef}
          onPointerDown={(e) => {
            interactedRef.current = true;
            draggingRef.current = true;
            updateFromClientX(e.clientX);
          }}
          className="relative mt-12 grid cursor-ew-resize select-none overflow-hidden rounded-3xl border border-navy/10 shadow-xl shadow-navy/5"
          style={{ touchAction: "pan-y" }}
        >
          {/* Janvier (couche de base) */}
          <div className="[grid-area:1/1]">
            <Panel after={false} />
          </div>

          {/* Juillet (couche révélée) */}
          <div
            className="[grid-area:1/1]"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          >
            <Panel after={true} />
          </div>

          {/* Poignée */}
          <div
            className="absolute inset-y-0 z-10 [grid-area:1/1]"
            style={{ left: `${pos}%` }}
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 -ml-px w-0.5 bg-navy/80" />
          </div>
          <button
            type="button"
            role="slider"
            aria-label="Comparer avant et après"
            aria-valuemin={6}
            aria-valuemax={94}
            aria-valuenow={Math.round(pos)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                interactedRef.current = true;
                setPos((p) =>
                  Math.min(94, Math.max(6, p + (e.key === "ArrowLeft" ? -5 : 5)))
                );
              }
            }}
            className="absolute top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-navy text-white shadow-lg shadow-navy/30 outline-offset-4 transition-transform hover:scale-105 active:scale-95"
            style={{ left: `${pos}%` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-foreground/40">
          Parcours représentatif d’un accompagnement type de six mois.
        </p>
      </div>
    </section>
  );
}
