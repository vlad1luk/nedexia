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
            className={`group relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border-teal bg-teal/8 text-navy shadow-[0_10px_30px_-14px_rgba(20,150,150,0.5)]"
                : "border-navy/10 bg-white text-foreground/75 hover:-translate-y-px hover:border-teal/45 hover:shadow-[0_10px_26px_-18px_rgba(49,49,132,0.35)]"
            }`}
          >
            <span
              aria-hidden
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                isSelected
                  ? "border-teal bg-teal"
                  : "border-navy/20 bg-background group-hover:border-teal/50"
              }`}
            >
              {isSelected ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[0.95rem] font-medium leading-snug">
                {opt.label}
              </span>
              {opt.description ? (
                <span className="text-xs text-foreground/55">{opt.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
