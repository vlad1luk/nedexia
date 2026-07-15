"use client";

import { useRef, useState } from "react";

import { EdenBubble } from "./eden-bubble";
import { QuestionFlow, type FlowQuestion } from "./question-flow";
import { TunnelLayout } from "./tunnel-layout";
import { QUESTIONS_INTENTION } from "@/lib/espace/questions";
import { INTENTION_LABELS } from "@/lib/espace/types";
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
  const questions: FlowQuestion[] = QUESTIONS_INTENTION[intention].map((q) => ({
    ...q,
    blocLabel: INTENTION_LABELS[intention],
  }));
  const [answers, setAnswers] = useState<Record<string, Scale>>(initial ?? {});
  // Le flow avance après un court délai : on lit la version la plus fraîche
  // des réponses via ce ref pour éviter une closure périmée à la fin.
  const answersRef = useRef(answers);
  answersRef.current = answers;

  return (
    <TunnelLayout screen={5} screenLabel="Votre situation" onBack={onBack}>
      <div className="flex flex-col gap-6">
        <EdenBubble eyebrow="Eden · Étape 5/5">
          {INTENTION_INTRO[intention]}
        </EdenBubble>

        <QuestionFlow
          questions={questions}
          answers={answers}
          onAnswer={(id, v) => setAnswers((prev) => ({ ...prev, [id]: v }))}
          onFinished={() => {
            const latest = answersRef.current;
            if (questions.every((q) => latest[q.id] !== undefined)) {
              onContinue(latest);
            }
          }}
          onExitBack={onBack}
        />
      </div>
    </TunnelLayout>
  );
}
