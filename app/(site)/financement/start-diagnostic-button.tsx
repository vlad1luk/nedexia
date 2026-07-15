"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Nom de l'événement qui démarre le tunnel de diagnostic, où qu'on soit
 * sur la page. Écouté par `diagnostic-financement.tsx`.
 */
export const START_EVENT = "nedexia:financement-start";

export function startDiagnostic() {
  window.dispatchEvent(new CustomEvent(START_EVENT));
  document
    .getElementById("diagnostic")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type Props = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

/**
 * CTA « Commencer mon diagnostic ». Pas de pilule bleu marine : un bouton
 * « scellé » — coin coupé façon souche de billet/document officiel, liseré
 * rouille au survol (l'encre du sceau), inscrit en petites capitales.
 */
export function StartDiagnosticButton({
  children,
  variant = "primary",
  className,
}: Props) {
  const notch = { clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)" };

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={startDiagnostic}
        className={cn(
          "inline-flex items-center justify-center gap-2 border border-ink/20 bg-transparent px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors hover:border-rust/50 hover:text-rust",
          className
        )}
        style={notch}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startDiagnostic}
      style={notch}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-parchment transition-all",
        "hover:bg-[#232e3d]",
        "before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:bg-rust before:transition-all before:content-['']",
        className
      )}
    >
      {children}
    </button>
  );
}
