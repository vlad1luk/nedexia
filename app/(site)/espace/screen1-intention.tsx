"use client";

import { useState } from "react";

import { ChoiceGrid, type ChoiceOption } from "./choice-grid";
import { EdenBubble } from "./eden-bubble";
import { TunnelLayout } from "./tunnel-layout";
import {
  INTENTION_LABELS,
  type Intention,
  type IntentionPrecision,
} from "@/lib/espace/types";
import { INTENTION_REACTIONS } from "@/lib/espace/questions";

type Props = {
  initial?: Intention;
  initialPrecision?: IntentionPrecision;
  onBack: () => void;
  onContinue: (intention: Intention, precision?: IntentionPrecision) => void;
};

const OPTIONS: ChoiceOption<Intention>[] = (
  Object.keys(INTENTION_LABELS) as Intention[]
).map((key) => ({ value: key, label: INTENTION_LABELS[key] }));

const PRECISION_OPTIONS: ChoiceOption<IntentionPrecision>[] = [
  { value: "croissance", label: "Plutôt en croissance" },
  { value: "stabilite", label: "Plutôt en stabilité" },
  { value: "transition", label: "Plutôt en transition" },
];

export function Screen1Intention({
  initial,
  initialPrecision,
  onBack,
  onContinue,
}: Props) {
  const [intention, setIntention] = useState<Intention | null>(initial ?? null);
  const [precision, setPrecision] = useState<IntentionPrecision | null>(
    initialPrecision ?? null
  );

  const needsPrecision = intention === "exploration";
  const canContinue =
    intention !== null && (!needsPrecision || precision !== null);

  return (
    <TunnelLayout screen={1} screenLabel="Intention" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <EdenBubble eyebrow="Eden · Étape 1/5">
          Bonjour, je suis Eden. Avant de regarder où en est votre entreprise,
          dites-moi{" "}
          <strong className="font-medium text-navy">ce qui vous amène</strong>.
          Il n&rsquo;y a pas de mauvaise réponse — ça m&rsquo;aide juste à vous
          orienter.
        </EdenBubble>

        <div className="flex flex-col gap-2">
          <h2 className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-foreground/55">
            Votre objectif principal en ce moment ?
          </h2>
          <ChoiceGrid
            options={OPTIONS}
            value={intention}
            onSelect={(v) => {
              setIntention(v);
              if (v !== "exploration") setPrecision(null);
            }}
            columns={1}
          />
        </div>

        {needsPrecision ? (
          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4">
            <EdenBubble>
              Aucun souci, c&rsquo;est très fréquent. Une question de plus va
              m&rsquo;aider : votre entreprise est-elle plutôt en{" "}
              <strong className="font-medium text-navy">croissance</strong>,{" "}
              <strong className="font-medium text-navy">stabilité</strong>, ou{" "}
              <strong className="font-medium text-navy">transition</strong> ?
            </EdenBubble>
            <ChoiceGrid
              options={PRECISION_OPTIONS}
              value={precision}
              onSelect={setPrecision}
              columns={1}
            />
          </div>
        ) : null}

        {intention && (!needsPrecision || precision) ? (
          <EdenBubble tone="success" eyebrow="Eden">
            {INTENTION_REACTIONS[intention]}
          </EdenBubble>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() =>
              intention && onContinue(intention, precision ?? undefined)
            }
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </div>
    </TunnelLayout>
  );
}
