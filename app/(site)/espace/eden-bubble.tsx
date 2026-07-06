"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import symbole from "@/public/symbole-eden.png";

type Props = {
  children: ReactNode;
  /** Petite étiquette discrète au-dessus de la bulle (ex: "Eden · Étape 1/5") */
  eyebrow?: string;
  /** Variation visuelle — par défaut, ton standard Eden */
  tone?: "default" | "success";
};

/**
 * Bulle de message d'Eden pendant le parcours — même langage visuel que le
 * chat du workspace, pour que le tunnel et l'espace parlent d'une seule voix.
 */
export function EdenBubble({ children, eyebrow, tone = "default" }: Props) {
  const surface =
    tone === "success" ? "border border-leaf/40 bg-leaf/10" : "bg-navy/5";

  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white p-1.5">
        <Image src={symbole} alt="" className="h-auto w-full" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {eyebrow ? (
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-teal">
            {eyebrow}
          </span>
        ) : null}
        <div
          className={`w-full rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-foreground/80 sm:text-[0.95rem] ${surface}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
