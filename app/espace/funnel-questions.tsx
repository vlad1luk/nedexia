"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getDimension, questions } from "./diagnostic";

export function QuestionsStep({
  index,
  answers,
  onAnswer,
  onBack,
}: {
  index: number;
  answers: Record<string, number>;
  onAnswer: (questionId: string, choixIndex: number) => void;
  onBack: () => void;
}) {
  const question = questions[index];
  const dimension = getDimension(question.dimension);
  const selection = answers[question.id];

  const [enAttente, setEnAttente] = useState<number | null>(null);
  const [questionCourante, setQuestionCourante] = useState(question.id);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nouvelle question : on repart sans choix en attente.
  if (questionCourante !== question.id) {
    setQuestionCourante(question.id);
    setEnAttente(null);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [question.id]);

  const repondre = (choixIndex: number) => {
    if (timer.current) return;
    setEnAttente(choixIndex);
    timer.current = setTimeout(() => {
      timer.current = null;
      onAnswer(question.id, choixIndex);
    }, 260);
  };

  const affichee = enAttente ?? selection;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-teal">{dimension.label}</span>
        <span className="text-foreground/50">
          Question {index + 1} sur {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-navy sm:text-3xl">
            {question.titre}
          </h1>

          <div className="mt-8 space-y-3">
            {question.choix.map((choix, i) => {
              const active = affichee === i;
              return (
                <button
                  key={choix}
                  type="button"
                  onClick={() => repondre(i)}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy/5 ${
                    active
                      ? "border-leaf bg-white shadow-md shadow-leaf/10"
                      : "border-navy/10 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      active ? "border-leaf bg-leaf text-white" : "border-navy/20"
                    }`}
                  >
                    {active && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-base ${active ? "font-semibold text-navy" : "text-foreground/80"}`}
                  >
                    {choix}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={onBack}
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground/50 transition-colors hover:text-navy"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {index === 0 ? "Revenir à votre entreprise" : "Question précédente"}
      </button>
    </div>
  );
}
