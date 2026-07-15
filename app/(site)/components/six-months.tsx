"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Élément signature de /eden — instrument avant/après.
 * Pas un slider SaaS pastel : deux feuillets de registre côte à côte,
 * poignée rectangulaire laiton/encre, traits d'encre au lieu de pastilles
 * colorées. Contenu inchangé.
 */

const rows = [
  {
    label: "États financiers",
    before: "8 mois de retard",
    after: "À jour, revus chaque mois",
  },
  {
    label: "Dépendance au dirigeant",
    before: "Tout passe par lui",
    after: "Deux relais formés",
  },
  {
    label: "Processus documentés",
    before: "2 sur 14",
    after: "12 sur 14",
  },
  {
    label: "Dossier de financement",
    before: "Inexistant",
    after: "Déposé à la BDC",
  },
  {
    label: "Plan de relève",
    before: "Aucun",
    after: "Signé, échéancier 3 ans",
  },
];

function Panel({ after }: { after: boolean }) {
  return (
    <div
      className={`flex h-full flex-col p-6 sm:p-8 ${
        after ? "bg-parchment" : "bg-parchment-deep"
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-3">
        <p className="text-sm text-ink-soft">PME manufacturière · Montérégie</p>
        <p
          className={`font-[family-name:var(--font-fraunces)] text-sm italic ${
            after ? "text-moss" : "text-ink-soft"
          }`}
        >
          {after ? "Juillet" : "Janvier"}
        </p>
      </div>

      <ul className="mt-2 flex flex-col">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex min-h-11 items-center justify-between gap-4 border-b border-dotted border-ink/15 py-2.5 last:border-b-0"
          >
            <span className="text-sm text-ink-soft">{row.label}</span>
            <span
              className={`flex items-center gap-2 text-right text-sm font-medium ${
                after ? "text-ink" : "text-ink-soft"
              }`}
            >
              <span
                aria-hidden
                className={`font-[family-name:var(--font-fraunces)] text-xs italic ${
                  after ? "text-moss" : "text-rust"
                }`}
              >
                {after ? "✓" : "—"}
              </span>
              {after ? row.after : row.before}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-ink/15 pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Score de préparation
          </span>
          <span
            className={`font-[family-name:var(--font-fraunces)] text-3xl font-medium tabular-nums ${
              after ? "text-ink" : "text-ink-soft"
            }`}
          >
            {after ? 74 : 46}
          </span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden bg-ink/10">
          <div
            className={`h-full ${after ? "w-[74%] bg-moss" : "w-[46%] bg-ink/30"}`}
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
    <section className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Preuve de terrain
          </span>
          <h2 className="mt-2 text-balance font-[family-name:var(--font-fraunces)] text-3xl font-medium text-ink sm:text-4xl">
            Six mois d’écart
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
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
          className="relative mt-12 grid cursor-ew-resize select-none overflow-hidden border border-ink/15 shadow-[3px_4px_0_0_rgba(27,36,48,0.08)]"
          style={{ touchAction: "pan-y" }}
        >
          <div className="[grid-area:1/1]">
            <Panel after={false} />
          </div>

          <div
            className="[grid-area:1/1]"
            style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          >
            <Panel after={true} />
          </div>

          <div
            className="absolute inset-y-0 z-10 [grid-area:1/1]"
            style={{ left: `${pos}%` }}
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 -ml-px w-px bg-ink" />
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
            className="absolute top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center bg-ink text-parchment outline-offset-4 transition-colors hover:bg-[#232e3d]"
            style={{
              left: `${pos}%`,
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-ink-soft/70">
          Parcours représentatif d’un accompagnement type de six mois.
        </p>
      </div>
    </section>
  );
}
