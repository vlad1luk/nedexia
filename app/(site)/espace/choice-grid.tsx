"use client";

import type { ReactNode } from "react";

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: ChoiceOption<T>[];
  onSelect: (value: T) => void;
  value?: T | null;
  /** Disposition en 1 ou 2 colonnes — par défaut 1 sur mobile, 2 sur desktop */
  columns?: 1 | 2;
  disabled?: boolean;
};

export function ChoiceGrid<T extends string>({
  options,
  onSelect,
  value,
  columns = 2,
  disabled = false,
}: Props<T>) {
  const grid =
    columns === 1
      ? "grid grid-cols-1 gap-2"
      : "grid grid-cols-1 gap-2 sm:grid-cols-2";

  return (
    <div className={grid}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            className={`group relative flex w-full flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border-teal bg-teal/10 text-navy shadow-[0_8px_22px_-12px_rgba(20,150,150,0.45)]"
                : "border-navy/10 bg-white text-foreground/75 hover:border-teal/40 hover:bg-teal/5"
            }`}
          >
            <span className="text-[0.95rem] font-medium leading-snug">
              {opt.label}
            </span>
            {opt.description ? (
              <span className="text-xs text-foreground/55">{opt.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
