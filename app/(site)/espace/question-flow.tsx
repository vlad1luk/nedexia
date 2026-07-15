"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { Question } from "@/lib/espace/questions";
import { DIMENSION_LABELS } from "@/lib/espace/types";
import type { Scale } from "@/lib/espace/types";

export type FlowQuestion = Question & {
  /** Étiquette du groupe affichée au-dessus de la question (ex. « Finances ») */
  blocLabel: string;
};

type Props = {
  questions: FlowQuestion[];
  answers: Record<string, Scale>;
  onAnswer: (id: string, value: Scale) => void;
  /** Appelé quand on avance après la dernière question */
  onFinished: () => void;
  /** Retour depuis la première question (sortie du flow) */
  onExitBack: () => void;
  /** Index de départ (ex. pour revenir modifier une question) */
  startIndex?: number;
  /** Mode correction : répondre renvoie directement au récapitulatif */
  editMode?: boolean;
};

/** Délai avant l'avance automatique après un choix (laisse voir la sélection). */
const ADVANCE_DELAY_MS = 420;

/**
 * Parcours « une question à la fois » : chaque question occupe l'écran,
 * la sélection avance automatiquement, le clavier (1/2/3, ←) fonctionne.
 */
export function QuestionFlow({
  questions,
  answers,
  onAnswer,
  onFinished,
  onExitBack,
  startIndex,
  editMode = false,
}: Props) {
  const firstUnanswered = questions.findIndex((q) => answers[q.id] === undefined);
  const [index, setIndex] = useState(() =>
    startIndex !== undefined
      ? startIndex
      : firstUnanswered === -1
        ? questions.length - 1
        : firstUnanswered
  );
  const [direction, setDirection] = useState(1);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[index];
  const selected = answers[q.id];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setLocked(false);
    if (editMode || index >= questions.length - 1) onFinished();
    else setIndex(index + 1);
  }, [editMode, index, questions.length, onFinished]);

  const goBack = useCallback(() => {
    if (locked) return;
    setDirection(-1);
    if (editMode || index === 0) onExitBack();
    else setIndex(index - 1);
  }, [editMode, index, locked, onExitBack]);

  const choose = useCallback(
    (value: Scale) => {
      if (locked) return;
      onAnswer(q.id, value);
      setLocked(true);
      timerRef.current = setTimeout(goNext, ADVANCE_DELAY_MS);
    },
    [locked, onAnswer, q.id, goNext]
  );

  // Raccourcis clavier : 1/2/3 pour répondre, ← pour revenir
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goBack();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) {
        choose(q.options[n - 1].value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q, choose, goBack]);

  const progressPct = ((index + (selected !== undefined ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de progression */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-teal">
            {q.blocLabel}
          </span>
          <span className="text-xs tabular-nums text-foreground/45">
            {index + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-navy/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal to-leaf"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 170, damping: 26 }}
          />
        </div>
      </div>

      {/* Question courante */}
      <div className="relative min-h-[22rem]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={q.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2.5">
              <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-foreground/40">
                {q.title} · {DIMENSION_LABELS[q.dimension]}
              </span>
              <h2 className="text-balance text-xl font-semibold leading-snug text-navy sm:text-[1.45rem]">
                {q.prompt}
              </h2>
              {q.help ? (
                <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
                  {q.help}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={q.prompt}>
              {q.options.map((opt, i) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => choose(opt.value)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-150 sm:px-5 ${
                      isSelected
                        ? "border-teal bg-teal/8 shadow-[0_10px_30px_-14px_rgba(20,150,150,0.5)]"
                        : "border-navy/10 bg-white hover:-translate-y-px hover:border-teal/45 hover:shadow-[0_10px_26px_-18px_rgba(49,49,132,0.4)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold transition-colors ${
                        isSelected
                          ? "border-teal bg-teal text-white"
                          : "border-navy/15 bg-background text-foreground/45 group-hover:border-teal/50 group-hover:text-teal"
                      }`}
                    >
                      {isSelected ? <CheckIcon /> : i + 1}
                    </span>
                    <span
                      className={`text-[0.95rem] font-medium leading-snug ${
                        isSelected ? "text-navy" : "text-foreground/80"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation basse */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          className="text-xs font-medium uppercase tracking-[0.16em] text-foreground/50 transition hover:text-navy"
        >
          ← Précédent
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-[0.68rem] text-foreground/35 sm:block">
            Astuce : touches 1, 2, 3
          </span>
          {selected !== undefined ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              {editMode || index === questions.length - 1 ? "Terminer" : "Suivant"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
