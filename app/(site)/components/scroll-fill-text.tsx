"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function Word({
  children,
  progress,
  range,
  accent,
  accentClassName,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
  accentClassName: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={accent ? accentClassName : undefined}
    >
      {children}{" "}
    </motion.span>
  );
}

// Le texte se « remplit » mot par mot pendant le défilement.
export default function ScrollFillText({
  text,
  accents = [],
  className = "",
  accentClassName = "text-teal",
}: {
  text: string;
  accents?: string[];
  className?: string;
  /** Couleur des mots d’accent — défaut teal (psychologue) ; Matching passe rust. */
  accentClassName?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={`text-3xl font-bold leading-snug tracking-tight text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.25] ${className}`}
    >
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          accent={accents.includes(word.replace(/[.,;:!?…—«»]/g, ""))}
          accentClassName={accentClassName}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}
