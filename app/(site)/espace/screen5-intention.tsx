"use client";

import { useState } from "react";

import { ChoiceGrid, type ChoiceOption } from "./choice-grid";
import { EdenBubble } from "./eden-bubble";
import { TunnelLayout } from "./tunnel-layout";
import { QUESTIONS_INTENTION } from "@/lib/espace/questions";
import type { Intention, Scale } from "@/lib/espace/types";

type Props = {
  intention: Intention;
  initial?: Record<string, Scale>;
  onBack: () => void;
  onContinue: (answers: Record<string, Scale>) => void;
};

const INTENTION_INTRO: Record<Intention, string> = {
  commerce:
    "On a fait le tour des fondations. Avant le score, deux questions précises sur votre objectif commercial.",
  alliance:
    "Deux dernières questions, plus précises, sur votre démarche de partenariat.",
  cession:
    "Pour votre projet de cession, deux questions plus précises avant le score.",
  acquisition:
    "Pour votre projet d'acquisition, deux questions plus précises avant le score.",
  structuration:
    "Une dernière question pour caler vos priorités, avant le score.",
  exploration:
    "Une dernière question pour mieux saisir votre situation, avant le score.",
};

export function Screen5Intention({
  intention,
  initial,
  onBack,
  onContinue,
}: Props) {
  const questions = QUESTIONS_INTENTION[intention];
  const [answers, setAnswers] = useState<Record<string, Scale>>(initial ?? {});

  const setAnswer = (id: string, scale: Scale) =>
    setAnswers((prev) => ({ ...prev, [id]: scale }));

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <TunnelLayout screen={5} screenLabel="Votre situation" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <EdenBubble eyebrow="Eden · Étape 5/5">
          {INTENTION_INTRO[intention]}
        </EdenBubble>

        <section className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white/70 p-5">
          {questions.map((q, idx) => {
            const opts: ChoiceOption<string>[] = q.options.map((o) => ({
              value: String(o.value),
              label: o.label,
            }));
            return (
              <div key={q.id} className="flex flex-col gap-2">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-foreground/40">
                  Question {idx + 1} · {q.title}
                </span>
                <p className="text-[0.95rem] font-medium leading-snug text-navy">
                  {q.prompt}
                </p>
                <ChoiceGrid
                  options={opts}
                  value={
                    answers[q.id] !== undefined ? String(answers[q.id]) : null
                  }
                  onSelect={(v) => setAnswer(q.id, Number(v) as Scale)}
                  columns={1}
                />
              </div>
            );
          })}
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => onContinue(answers)}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Voir mon score
          </button>
        </div>
      </div>
    </TunnelLayout>
  );
}
