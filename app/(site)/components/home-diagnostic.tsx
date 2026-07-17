"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  FINANCEMENT_QUESTIONS,
  type FinancementAnswers,
} from "@/lib/financement/questions";
import { buildVerdict, formatMontant, type Verdict } from "@/lib/financement/verdict";
import { startDiagnostic, START_EVENT } from "../financement/start-diagnostic-button";

type Phase = "idle" | "flow" | "verdict";

const ADVANCE_DELAY = 360;
export default function HomeDiagnostic() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<FinancementAnswers>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    const handleStart = () => setPhase((current) => (current === "idle" ? "flow" : current));
    window.addEventListener(START_EVENT, handleStart);
    return () => window.removeEventListener(START_EVENT, handleStart);
  }, []);

  const finish = useCallback((finalAnswers: FinancementAnswers) => {
    setVerdict(buildVerdict(finalAnswers));
    setPhase("verdict");
  }, []);

  return (
    <section id="diagnostic" className="scroll-mt-16 border-y border-[#d9dfdc] bg-white">
      <div className="mx-auto max-w-[92rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="flex flex-col gap-3 border-b border-[#d9dfdc] pb-4 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#697478] sm:flex-row sm:items-center sm:justify-between">
          <span>Diagnostic de financement</span>
          <span>5 à 8 questions · résultat immédiat · aucun compte</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" ? (
            <IdleState key="idle" />
          ) : phase === "flow" ? (
            <QuestionState
              key="flow"
              index={index}
              answers={answers}
              onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
              onIndexChange={setIndex}
              onFinished={finish}
            />
          ) : verdict ? (
            <VerdictState key="verdict" verdict={verdict} />
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function IdleState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto max-w-5xl py-16 text-center sm:py-24"
    >
      <p className="font-mono text-5xl font-medium tracking-[-0.08em] text-[#5966e8] sm:text-7xl">10 min</p>
      <h2 className="mx-auto mt-8 max-w-4xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-[#1b2327] sm:text-6xl lg:text-7xl">
        À quel financement votre entreprise a-t-elle réellement droit ?
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#697478]">
        Répondez à quelques questions. Nous vous donnerons une première estimation chiffrée, pas une liste à trier.
      </p>
      <button
        type="button"
        onClick={startDiagnostic}
        className="group mt-9 inline-flex items-center gap-3 border-b border-[#1b2327] pb-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#1b2327]"
      >
        Commencer le diagnostic
        <span className="text-base text-[#5966e8] transition-transform duration-500 group-hover:translate-x-1">→</span>
      </button>
    </motion.div>
  );
}

type QuestionProps = {
  index: number;
  answers: FinancementAnswers;
  onAnswer: (id: string, value: string) => void;
  onIndexChange: (index: number) => void;
  onFinished: (answers: FinancementAnswers) => void;
};

function QuestionState({ index, answers, onAnswer, onIndexChange, onFinished }: QuestionProps) {
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const question = FINANCEMENT_QUESTIONS[index];

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const choose = (value: string) => {
    if (locked) return;
    onAnswer(question.id, value);
    answersRef.current = { ...answersRef.current, [question.id]: value };
    setLocked(true);
    timerRef.current = setTimeout(() => {
      setLocked(false);
      if (index === FINANCEMENT_QUESTIONS.length - 1) onFinished(answersRef.current);
      else onIndexChange(index + 1);
    }, ADVANCE_DELAY);
  };

  const selected = answers[question.id];
  const progress = ((index + 1) / FINANCEMENT_QUESTIONS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: reduce ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduce ? 0 : -24 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="mx-auto max-w-5xl py-12 sm:py-20"
    >
      <div className="flex items-center justify-between gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#697478]">
        <span>Lecture en cours</span>
        <span>{index + 1} / {FINANCEMENT_QUESTIONS.length}</span>
      </div>
      <div className="mt-4 h-1 bg-[#edf0ee]">
        <motion.div className="h-full origin-left bg-[#5966e8]" animate={{ width: `${progress}%` }} transition={{ duration: 0.45 }} />
      </div>

      <div className="mx-auto mt-16 max-w-4xl text-center">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#5966e8]">{question.title}</p>
        <h2 className="mt-6 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#1b2327] sm:text-6xl">{question.prompt}</h2>
        {question.help ? <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#697478]">{question.help}</p> : null}
      </div>

      <div role="radiogroup" aria-label={question.prompt} className="mx-auto mt-14 max-w-3xl border-t border-[#d9dfdc]">
        {question.options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => choose(option.value)}
              className={`group flex w-full items-center gap-5 border-b border-[#d9dfdc] py-5 text-left transition-[padding,color,background-color] duration-300 hover:bg-[#f7f8f6] hover:pl-4 ${isSelected ? "bg-[#eef0ff] pl-4 text-[#1b2327]" : "text-[#697478]"}`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-colors ${isSelected ? "border-[#5966e8] bg-[#5966e8]" : "border-[#aeb8b6] bg-transparent group-hover:border-[#5966e8]"}`} />
              <span className="flex-1 text-base font-medium sm:text-lg">{option.label}</span>
              <span className="text-lg text-[#5966e8] opacity-0 transition-opacity duration-300 group-hover:opacity-100">→</span>
            </button>
          );
        })}
      </div>
      <p className="mt-7 text-center font-mono text-[0.62rem] text-[#8b9596]">Votre réponse est enregistrée automatiquement.</p>
    </motion.div>
  );
}

function VerdictState({ verdict }: { verdict: Verdict }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl py-12 sm:py-20">
      <div className="flex flex-col gap-14 border-y border-[#d9dfdc] py-10 lg:flex-row lg:gap-20 lg:py-14">
        <div className="shrink-0 lg:w-[17rem]">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#5966e8]">Votre première lecture</p>
          <p className="mt-8 font-mono text-5xl font-medium leading-[0.86] tracking-[-0.1em] text-[#1b2327] sm:text-7xl">
            {formatMontant(verdict.montantEstime.min)}
            <span className="my-2 block font-sans text-base font-normal tracking-normal text-[#8b9596]">à</span>
            <span className="text-[#5966e8]">{formatMontant(verdict.montantEstime.max)}</span>
          </p>
          <p className="mt-7 max-w-xs text-sm leading-relaxed text-[#697478]">{verdict.portionFinancable}</p>
          <p className="mt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#8b9596]">Estimation indicative</p>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="max-w-2xl text-3xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#1b2327] sm:text-5xl">Voici où votre situation devient concrète.</h2>
          <div className="mt-10 border-t border-[#d9dfdc]">
            {verdict.programmes.map((program) => (
              <div key={program.nom} className="flex flex-col gap-3 border-b border-[#d9dfdc] py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <div>
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[#1b2327]">{program.nom}</p>
                  <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#697478]">{program.organisme}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#697478]">{program.angle}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#5966e8] sm:pt-1 sm:text-right">{program.couverture}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
        <div className="max-w-xl">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#5966e8]">La suite logique</p>
          <p className="mt-4 text-base leading-relaxed text-[#697478]">Le verdict vous donne une direction. Eden vous aide ensuite à transformer cette direction en dossier défendable.</p>
        </div>

        <div className="w-full max-w-xl">
          {sent ? (
            <p className="text-base leading-relaxed text-[#1b2327]"><strong>Votre verdict est conservé.</strong> La version détaillée suivra par courriel.</p>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); if (email.trim().length >= 5) setSent(true); }}>
              <label htmlFor="diagnostic-email" className="text-sm font-semibold text-[#1b2327]">Conserver ce verdict</label>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input id="diagnostic-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@entreprise.ca" className="min-w-0 flex-1 border-b border-[#aeb8b6] bg-transparent px-0 py-3 text-sm text-[#1b2327] placeholder:text-[#8b9596] focus:border-[#5966e8] focus:outline-none" />
                <button type="submit" className="border-b border-[#1b2327] px-1 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#1b2327] transition-colors hover:border-[#5966e8] hover:text-[#5966e8]">Recevoir</button>
              </div>
            </form>
          )}
          <Link href="/eden" className="group mt-8 inline-flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#1b2327]">
            Continuer avec Eden
            <span className="text-base text-[#5966e8] transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
