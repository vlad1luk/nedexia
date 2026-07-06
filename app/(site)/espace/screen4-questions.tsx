"use client";

import { useState } from "react";

import { ChoiceGrid, type ChoiceOption } from "./choice-grid";
import { DocumentUpload } from "./document-upload";
import { EdenBubble } from "./eden-bubble";
import { TunnelLayout } from "./tunnel-layout";
import {
  ALL_BLOC_A,
  ALL_BLOC_B,
  ALL_BLOC_C,
  type Question,
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

const BLOCS: Array<{
  letter: "A" | "B" | "C";
  title: string;
  description: string;
  questions: Question[];
}> = [
  {
    letter: "A",
    title: "Bloc A · Finances",
    description:
      "Trois questions sur la santé financière. Pas besoin de chiffres exacts ici.",
    questions: ALL_BLOC_A,
  },
  {
    letter: "B",
    title: "Bloc B · Indépendance",
    description:
      "Trois questions sur l'autonomie de votre entreprise vis-à-vis des personnes clés.",
    questions: ALL_BLOC_B,
  },
  {
    letter: "C",
    title: "Bloc C · Réputation",
    description:
      "Trois questions sur la confiance que votre entreprise inspire à l'extérieur.",
    questions: ALL_BLOC_C,
  },
];

function questionAsOptions(q: Question): ChoiceOption<string>[] {
  return q.options.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));
}

export function Screen4Questions({ initial, onBack, onContinue }: Props) {
  const [blocA, setBlocA] = useState<Record<string, Scale>>(initial?.blocA ?? {});
  const [blocB, setBlocB] = useState<Record<string, Scale>>(initial?.blocB ?? {});
  const [blocC, setBlocC] = useState<Record<string, Scale>>(initial?.blocC ?? {});
  const [file, setFile] = useState<{ name: string; size: number } | null>(
    initial?.fileName && typeof initial.fileSize === "number"
      ? { name: initial.fileName, size: initial.fileSize }
      : null
  );

  const setAnswer =
    (letter: "A" | "B" | "C") => (qId: string, scale: Scale) => {
      const setter =
        letter === "A" ? setBlocA : letter === "B" ? setBlocB : setBlocC;
      setter((prev) => ({ ...prev, [qId]: scale }));
    };

  const all = [...ALL_BLOC_A, ...ALL_BLOC_B, ...ALL_BLOC_C];
  const answeredCount =
    Object.keys(blocA).length +
    Object.keys(blocB).length +
    Object.keys(blocC).length;
  const allAnswered = answeredCount === all.length;

  return (
    <TunnelLayout screen={4} screenLabel="9 questions clés" onBack={onBack}>
      <div className="flex flex-col gap-5">
        <EdenBubble eyebrow="Eden · Étape 4/5">
          Voici <strong className="font-medium text-navy">9 questions</strong>{" "}
          réparties en 3 blocs. Pas de chiffres exacts — je veux situer votre
          niveau de préparation. Vous pourrez ajouter vos états financiers en
          option à la fin du bloc.
        </EdenBubble>

        {BLOCS.map((bloc) => {
          const current =
            bloc.letter === "A" ? blocA : bloc.letter === "B" ? blocB : blocC;
          return (
            <section
              key={bloc.letter}
              className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white/70 p-5"
            >
              <header className="flex flex-col gap-1">
                <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-teal">
                  {bloc.title}
                </h3>
                <p className="text-sm text-foreground/55">{bloc.description}</p>
              </header>
              <div className="flex flex-col gap-5">
                {bloc.questions.map((q, idx) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-foreground/40">
                      Question {idx + 1} · {q.title}
                    </span>
                    <p className="text-[0.95rem] font-medium leading-snug text-navy">
                      {q.prompt}
                    </p>
                    <ChoiceGrid
                      options={questionAsOptions(q)}
                      value={
                        current[q.id] !== undefined
                          ? String(current[q.id])
                          : null
                      }
                      onSelect={(v) =>
                        setAnswer(bloc.letter)(q.id, Number(v) as Scale)
                      }
                      columns={1}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
          <div className="border-b border-navy/10 bg-background/80 px-5 py-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-teal">
              Enrichissement
            </p>
            <p className="mt-1 text-sm text-foreground/75">
              Document optionnel — conservé pour la suite du parcours, sans
              analyse automatique à ce stade.
            </p>
          </div>
          <div className="p-5">
            <DocumentUpload value={file} onChange={setFile} />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-navy/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-navy">
              {answeredCount} sur {all.length} questions complétées
            </span>
            <div
              className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-navy/10"
              role="progressbar"
              aria-valuenow={answeredCount}
              aria-valuemin={0}
              aria-valuemax={all.length}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-leaf to-teal transition-all duration-300"
                style={{ width: `${(answeredCount / all.length) * 100}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() =>
              onContinue({
                blocA,
                blocB,
                blocC,
                file: file ?? undefined,
              })
            }
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </div>
    </TunnelLayout>
  );
}
