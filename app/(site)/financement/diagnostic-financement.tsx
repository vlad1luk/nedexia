"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  FINANCEMENT_QUESTIONS,
  type FinancementAnswers,
  type FinancementQuestion,
} from "@/lib/financement/questions";
import { buildVerdict, type Verdict } from "@/lib/financement/verdict";
import { cn } from "@/lib/utils";
import { startDiagnostic, START_EVENT } from "./start-diagnostic-button";
import { VerdictPanel } from "./verdict-panel";

/**
 * Tunnel de diagnostic financement — carte encre sur parchemin.
 *
 * Règle de parcours NON NÉGOCIABLE : aucune création de compte ni demande
 * de courriel avant l'affichage du verdict. La capture (courriel → espace)
 * vit dans `VerdictPanel`, APRÈS le résultat.
 *
 * Entièrement piloté par la config de `lib/financement/questions.ts` : une
 * question à la fois, jauge à graduations (règle, pas barre SaaS), retour
 * non destructif.
 */

type Phase = "idle" | "flow" | "verdict";

/** Laisse voir la sélection avant d'avancer automatiquement. */
const ADVANCE_DELAY_MS = 420;

export function DiagnosticFinancement() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<FinancementAnswers>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    const start = () => setPhase((p) => (p === "idle" ? "flow" : p));
    window.addEventListener(START_EVENT, start);
    return () => window.removeEventListener(START_EVENT, start);
  }, []);

  const finish = useCallback((finalAnswers: FinancementAnswers) => {
    // POINT D'INTÉGRATION : `buildVerdict` est mocké aujourd'hui — le futur
    // moteur de matching se branche dans lib/financement/verdict.ts sans
    // toucher à ce composant.
    setVerdict(buildVerdict(finalAnswers));
    setPhase("verdict");
  }, []);

  return (
    <section id="diagnostic" className="relative scroll-mt-20 bg-ink py-16 sm:py-24">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="border border-brass/25 bg-parchment px-5 py-8 sm:px-10 sm:py-12">
          <AnimatePresence mode="wait">
            {phase === "idle" ? (
              <IdleCard key="idle" />
            ) : phase === "flow" ? (
              <QuestionTunnel
                key="flow"
                questions={FINANCEMENT_QUESTIONS}
                index={index}
                answers={answers}
                onAnswer={(id, value) =>
                  setAnswers((prev) => ({ ...prev, [id]: value }))
                }
                onIndexChange={setIndex}
                onFinished={finish}
              />
            ) : verdict ? (
              <VerdictPanel key="verdict" verdict={verdict} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** État avant lancement — invite claire, le vrai CTA reste le hero. */
function IdleCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-5 py-6 text-center"
    >
      <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
        Le registre
      </span>
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-ink">
        Votre diagnostic se déroule ici
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-ink-soft">
        Six questions, une à la fois. Aucune donnée sensible, aucun compte —
        votre verdict s&rsquo;affiche directement sur cette page.
      </p>
      <button
        type="button"
        onClick={startDiagnostic}
        className="mt-2 border border-ink/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-rust hover:text-rust"
      >
        Lancer la première question
      </button>
    </motion.div>
  );
}

// ─────────────────────────── Tunnel de questions ───────────────────────────

type TunnelProps = {
  questions: FinancementQuestion[];
  index: number;
  answers: FinancementAnswers;
  onAnswer: (id: string, value: string) => void;
  onIndexChange: (i: number) => void;
  onFinished: (answers: FinancementAnswers) => void;
};

function QuestionTunnel({
  questions,
  index,
  answers,
  onAnswer,
  onIndexChange,
  onFinished,
}: TunnelProps) {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Les réponses arrivent via un setState asynchrone du parent — on garde la
  // dernière valeur localement pour la passer à `onFinished` sans course.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const q = questions[index];
  const selected = answers[q.id];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const goNext = useCallback(() => {
    setLocked(false);
    setDirection(1);
    if (index >= questions.length - 1) onFinished(answersRef.current);
    else onIndexChange(index + 1);
  }, [index, questions.length, onFinished, onIndexChange]);

  const goBack = useCallback(() => {
    if (locked || index === 0) return;
    setDirection(-1);
    onIndexChange(index - 1);
  }, [index, locked, onIndexChange]);

  const choose = useCallback(
    (value: string) => {
      if (locked) return;
      onAnswer(q.id, value);
      answersRef.current = { ...answersRef.current, [q.id]: value };
      setLocked(true);
      timerRef.current = setTimeout(goNext, ADVANCE_DELAY_MS);
    },
    [locked, onAnswer, q.id, goNext]
  );

  // Clavier : 1-9 pour répondre, ← pour revenir (retour non destructif).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goBack();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) choose(q.options[n - 1].value);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q, choose, goBack]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-7"
    >
      {/* En-tête : jauge à graduations, façon règle */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Question {index + 1} / {questions.length}
          </span>
          <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-ink-soft">
            {q.title}
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((step, i) => {
            const done = answers[step.id] !== undefined;
            const current = i === index;
            return (
              <span
                key={step.id}
                className={cn(
                  "h-[3px] flex-1 bg-ink/10 transition-colors duration-300",
                  done && "bg-ink/70",
                  current && !done && "bg-rust/60"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Question courante */}
      <div className="relative min-h-[22rem]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={q.id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 32 }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -32 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-balance font-[family-name:var(--font-fraunces)] text-2xl font-medium leading-snug text-ink sm:text-[1.7rem]">
              {q.prompt}
            </h3>
            {q.help ? (
              <p className="-mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                {q.help}
              </p>
            ) : null}

            <div className="flex flex-col" role="radiogroup" aria-label={q.prompt}>
              {q.options.map((opt, i) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => choose(opt.value)}
                    className={cn(
                      "group flex w-full items-center gap-4 border-t border-ink/12 py-4 text-left transition-colors last:border-b",
                      isSelected ? "bg-ink/5" : "hover:bg-ink/[0.03]"
                    )}
                  >
                    <span
                      className={cn(
                        "font-[family-name:var(--font-fraunces)] text-sm italic",
                        isSelected ? "text-rust" : "text-brass/70"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[0.98rem] font-medium leading-snug",
                        isSelected ? "text-ink" : "text-ink-soft"
                      )}
                    >
                      {opt.label}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "ml-auto h-2 w-2 shrink-0 rounded-full border transition-all",
                        isSelected
                          ? "border-rust bg-rust"
                          : "border-ink/25 bg-transparent group-hover:border-ink/50"
                      )}
                    />
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
          disabled={index === 0}
          className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Précédent
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-[0.66rem] text-ink-soft/60 sm:block">
            Touches 1, 2, 3…
          </span>
          {selected !== undefined ? (
            <button
              type="button"
              onClick={goNext}
              className="border border-ink bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-parchment transition-colors hover:bg-[#232e3d]"
            >
              {index === questions.length - 1 ? "Voir mon verdict" : "Suivant"}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
