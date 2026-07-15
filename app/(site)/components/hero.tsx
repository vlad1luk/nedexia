"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { LedgerLink } from "./ledger-link";

/**
 * Héro de la page d'accueil — système « carnet de terrain » (voir
 * /financement). Centré, sans image latérale : étiquette de spécimen,
 * titre serif à verbe rotatif (l'unique italique rouille), puis la vigne
 * qui pousse — redessinée à l'encre et au laiton, plus au feutre coloré.
 */

const verbs = ["grandir", "se structurer", "s’allier", "transmettre"];

// Points sur la vigne (x, y) — les bourgeons éclosent au passage du trait.
const buds = [
  { x: 215, y: 82 },
  { x: 430, y: 80 },
  { x: 650, y: 40 },
  { x: 870, y: 90 },
  { x: 1054, y: 124 },
  { x: 1200, y: 60 },
];

const leaves = [
  { x: 215, y: 82, rotate: -100 },
  { x: 650, y: 40, rotate: -80 },
  { x: 870, y: 90, rotate: -110 },
];

const VINE_DURATION = 2.4;
const VINE_DELAY = 0.5;

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % verbs.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-parchment">
      <div className="relative mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        {/* Étiquette de spécimen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto flex w-fit items-center gap-3 border-b border-ink/15 pb-3"
        >
          <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
            N&deg;00
          </span>
          <span className="h-3 w-px bg-ink/15" />
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
            Nedexia · Jardin d&rsquo;entreprises · Québec
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="mt-8 text-balance font-[family-name:var(--font-fraunces)] text-[2.6rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]"
        >
          Le jardin où les PME québécoises viennent
          <span className="relative block h-[1.25em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={verbs[index]}
                initial={{ opacity: 0, y: "0.45em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: "-0.45em", filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-x-0 top-[0.1em] italic text-rust"
              >
                {verbs[index]}.
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.18 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ink-soft sm:text-xl"
        >
          Eden, votre tuteur de croissance, vous prépare d’abord. Puis il vous
          connecte à des entreprises réellement compatibles — quand le moment
          est venu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
        >
          <LedgerLink href="/eden">Rencontrer Eden</LedgerLink>
          <a
            href="#ecosysteme"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-ink transition-colors hover:text-rust"
          >
            Découvrir l’écosystème
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* La vigne qui pousse — trait d'encre, bourgeons de laiton, feuilles de mousse */}
      <div className="relative mt-14 sm:mt-20" aria-hidden="true">
        <svg viewBox="0 0 1200 150" fill="none" className="w-full">
          <motion.path
            d="M0 100 C 150 30, 280 130, 430 80 S 720 20, 870 90 S 1100 120, 1200 60"
            stroke="var(--color-ink)"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: VINE_DURATION, ease: "easeInOut", delay: VINE_DELAY }}
          />
          {buds.map((bud) => (
            <motion.circle
              key={bud.x}
              cx={bud.x}
              cy={bud.y}
              fill="var(--color-brass)"
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 5, opacity: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 14,
                delay: VINE_DELAY + (bud.x / 1200) * VINE_DURATION,
              }}
            />
          ))}
          {leaves.map((leaf) => (
            <g
              key={leaf.x}
              transform={`translate(${leaf.x} ${leaf.y - 8}) rotate(${leaf.rotate})`}
            >
              <motion.path
                d="M0 0 C 4 -16, 16 -26, 30 -26 C 30 -12, 18 -2, 0 0 Z"
                fill="var(--color-moss)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: VINE_DELAY + (leaf.x / 1200) * VINE_DURATION + 0.15,
                }}
              />
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
