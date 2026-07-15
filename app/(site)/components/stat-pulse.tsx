"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { useInView } from "motion/react";
import { useRef } from "react";

/**
 * Compteur qui s’allume au scroll — Number Flow déjà au catalogue
 * financement, réutilisé ici pour le chiffre ~50 %.
 */
export function StatPulse({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (inView) setN(value);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <NumberFlow value={n} locales="fr-CA" />
      {suffix}
    </span>
  );
}
