"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { DocumentUpload } from "./document-upload";
import { EdenBubble } from "./eden-bubble";
import { QuestionFlow, type FlowQuestion } from "./question-flow";
import { TunnelLayout } from "./tunnel-layout";
import {
  ALL_BLOC_A,
  ALL_BLOC_B,
  ALL_BLOC_C,
} from "@/lib/espace/questions";
import type { Scale } from "@/lib/espace/types";

type Props = {
  initial?: {
    blocA?: Record<string, Scale>;
    blocB?: Record<string, Scale>;
    blocC?: Record<string, Scale>;
    fileName?: string;
    fileSize?: number;
  };
  onBack: () => void;
  onContinue: (data: {
    blocA: Record<string, Scale>;
    blocB: Record<string, Scale>;
    blocC: Record<string, Scale>;
    file?: { name: string; size: number };
  }) => void;
};

const BLOC_LABELS = {
  A: "Finances",
  B: "Indépendance",
  C: "Réputation",
} as const;

const FLOW_QUESTIONS: FlowQuestion[] = [
  ...ALL_BLOC_A.map((q) => ({ ...q, blocLabel: BLOC_LABELS.A })),
  ...ALL_BLOC_B.map((q) => ({ ...q, blocLabel: BLOC_LABELS.B })),
  ...ALL_BLOC_C.map((q) => ({ ...q, blocLabel: BLOC_LABELS.C })),
];

function blocOf(qId: string): "A" | "B" | "C" {
  if (ALL_BLOC_A.some((q) => q.id === qId)) return "A";
  if (ALL_BLOC_B.some((q) => q.id === qId)) return "B";
  return "C";
}

export function Screen4Questions({ initial, onBack, onContinue }: Props) {
  const [answers, setAnswers] = useState<Record<string, Scale>>({
    ...(initial?.blocA ?? {}),
    ...(initial?.blocB ?? {}),
    ...(initial?.blocC ?? {}),
  });
  const [file, setFile] = useState<{ name: string; size: number } | null>(
    initial?.fileName && typeof initial.fileSize === "number"
      ? { name: initial.fileName, size: initial.fileSize }
      : null
  );

  const allAnswered = FLOW_QUESTIONS.every((q) => answers[q.id] !== undefined);
  const [phase, setPhase] = useState<"intro" | "flow" | "recap">(
    allAnswered ? "recap" : "intro"
  );
  const [flowStart, setFlowStart] = useState<number | undefined>(undefined);

  const grouped = useMemo(() => {
    const out = { A: {} as Record<string, Scale>, B: {} as Record<string, Scale>, C: {} as Record<string, Scale> };
    for (const [id, v] of Object.entries(answers)) out[blocOf(id)][id] = v;
    return out;
  }, [answers]);

  const handleFinish = () =>
    onContinue({
      blocA: grouped.A,
      blocB: grouped.B,
      blocC: grouped.C,
      file: file ?? undefined,
    });

  const editQuestion = (qId: string) => {
    const idx = FLOW_QUESTIONS.findIndex((q) => q.id === qId);
    if (idx === -1) return;
    setFlowStart(idx);
    setPhase("flow");
  };

  return (
    <TunnelLayout screen={4} screenLabel="9 questions clés" onBack={onBack}>
      {phase === "intro" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <EdenBubble eyebrow="Eden · Étape 4/5">
            On entre dans le cœur du diagnostic :{" "}
            <strong className="font-medium text-navy">9 questions</strong>, une
            à la fois. Pas besoin de chiffres exacts — répondez avec ce que
            vous savez aujourd&rsquo;hui, honnêtement. C&rsquo;est ce qui rend
            la lecture utile.
          </EdenBubble>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ["A", "Finances", "Lisibilité des chiffres, dépendance client, trajectoire."],
                ["B", "Indépendance", "Ce qui se passe quand vous n'êtes pas là."],
                ["C", "Réputation", "Ce que le marché voit et dit de vous."],
              ] as const
            ).map(([letter, title, desc], i) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (i + 1) }}
                className="flex flex-col gap-1.5 rounded-2xl border border-navy/10 bg-white p-4"
              >
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-teal">
                  Bloc {letter} · {title}
                </span>
                <p className="text-sm leading-relaxed text-foreground/60">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setFlowStart(undefined);
                setPhase("flow");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              C&rsquo;est parti
            </button>
          </div>
        </motion.div>
      ) : phase === "flow" ? (
        <QuestionFlow
          questions={FLOW_QUESTIONS}
          answers={answers}
          onAnswer={(id, v) => setAnswers((prev) => ({ ...prev, [id]: v }))}
          onFinished={() => setPhase("recap")}
          onExitBack={() => setPhase(flowStart !== undefined ? "recap" : "intro")}
          startIndex={flowStart}
          editMode={flowStart !== undefined}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          <EdenBubble tone="success" eyebrow="Eden">
            Merci — j&rsquo;ai ce qu&rsquo;il me faut sur les fondations. Voici
            vos réponses : vous pouvez en modifier une avant de continuer.
          </EdenBubble>

          {/* Récapitulatif des réponses, groupées par bloc */}
          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
            {(["A", "B", "C"] as const).map((letter) => {
              const questions = FLOW_QUESTIONS.filter(
                (q) => q.blocLabel === BLOC_LABELS[letter]
              );
              return (
                <div key={letter} className="border-b border-navy/8 last:border-b-0">
                  <div className="bg-background/70 px-4 py-2.5 sm:px-5">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-teal">
                      {BLOC_LABELS[letter]}
                    </span>
                  </div>
                  <ul>
                    {questions.map((q) => {
                      const v = answers[q.id];
                      const opt = q.options.find((o) => o.value === v);
                      return (
                        <li key={q.id} className="border-t border-navy/6 first:border-t-0">
                          <button
                            type="button"
                            onClick={() => editQuestion(q.id)}
                            className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-teal/4 sm:px-5"
                          >
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-foreground/40">
                                {q.title}
                              </span>
                              <span className="truncate text-sm font-medium text-navy">
                                {opt?.label ?? "—"}
                              </span>
                            </span>
                            <span
                              className={`flex shrink-0 items-center gap-2 text-xs ${
                                v === 3
                                  ? "text-leaf-deep"
                                  : v === 2
                                    ? "text-foreground/50"
                                    : "text-foreground/50"
                              }`}
                            >
                              <span
                                aria-hidden
                                className={`h-2 w-2 rounded-full ${
                                  v === 3 ? "bg-leaf" : v === 2 ? "bg-teal/60" : "bg-navy/25"
                                }`}
                              />
                              <span className="font-medium text-foreground/40 opacity-0 transition group-hover:opacity-100">
                                Modifier
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Document optionnel */}
          <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
            <div className="border-b border-navy/10 bg-background/70 px-5 py-3.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-teal">
                En option
              </p>
              <p className="mt-1 text-sm text-foreground/65">
                Ajoutez un document (états financiers, plan d&rsquo;affaires) —
                conservé pour la suite du parcours.
              </p>
            </div>
            <div className="p-5">
              <DocumentUpload value={file} onChange={setFile} />
            </div>
          </section>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={!FLOW_QUESTIONS.every((q) => answers[q.id] !== undefined)}
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </motion.div>
      )}
    </TunnelLayout>
  );
}
