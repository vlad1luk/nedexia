"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LeafShape } from "./icons";

const verbs = [
  { text: "grandir", className: "text-leaf-deep" },
  { text: "se structurer", className: "text-sky" },
  { text: "s’allier", className: "text-teal" },
  { text: "transmettre", className: "text-blossom" },
];

// points sur la vigne (x, y) — les bourgeons éclosent au passage du trait
const buds = [
  { x: 215, y: 82, color: "#ffc20e" },
  { x: 430, y: 80, color: "#99ca3c" },
  { x: 650, y: 40, color: "#149696" },
  { x: 870, y: 90, color: "#f06799" },
  { x: 1054, y: 124, color: "#0087cb" },
  { x: 1200, y: 60, color: "#f26522" },
];

const VINE_DURATION = 2.4;
const VINE_DELAY = 0.5;

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % verbs.length), 2800);
    return () => clearInterval(id);
  }, []);

  const verb = verbs[index];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-leaf/15 blur-3xl" />
        <div className="absolute top-24 -right-40 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-sun/10 blur-3xl" />
        <LeafShape className="animate-float absolute top-28 left-[8%] hidden h-9 w-9 text-leaf/30 lg:block" />
        <LeafShape className="animate-float absolute top-40 right-[10%] hidden h-7 w-7 rotate-90 text-teal/25 lg:block [animation-delay:2s]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6 sm:pt-28">
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-[2.6rem] font-bold leading-[1.08] tracking-tight text-navy sm:text-6xl lg:text-7xl"
        >
          Le jardin où les PME québécoises viennent
          <span className="relative block h-[1.25em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={verb.text}
                initial={{ opacity: 0, y: "0.45em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: "-0.45em", filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className={`absolute inset-x-0 top-[0.1em] ${verb.className}`}
              >
                {verb.text}.
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70 sm:text-xl"
        >
          Eden, votre tuteur de croissance, vous prépare d’abord. Puis il vous
          connecte à des entreprises réellement compatibles — quand le moment
          est venu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          <Link
            href="/eden"
            className="rounded-full bg-navy px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy/20 transition-all hover:-translate-y-0.5 hover:bg-navy-deep"
          >
            Rencontrer Eden
          </Link>
          <a
            href="#ecosysteme"
            className="group inline-flex items-center gap-2 text-base font-semibold text-navy transition-colors hover:text-teal"
          >
            Découvrir l’écosystème
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-y-0.5">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* La vigne qui pousse */}
      <div className="relative mt-14 sm:mt-20" aria-hidden="true">
        <svg viewBox="0 0 1200 150" fill="none" className="w-full">
          <defs>
            <linearGradient id="vine-gradient" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#99ca3c" />
              <stop offset="0.5" stopColor="#149696" />
              <stop offset="1" stopColor="#0087cb" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0 100 C 150 30, 280 130, 430 80 S 720 20, 870 90 S 1100 120, 1200 60"
            stroke="url(#vine-gradient)"
            strokeWidth="3"
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
              fill={bud.color}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 6, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 14,
                delay: VINE_DELAY + (bud.x / 1200) * VINE_DURATION,
              }}
            />
          ))}
          {[
            { x: 215, y: 82, rotate: -100, color: "#99ca3c" },
            { x: 650, y: 40, rotate: -80, color: "#149696" },
            { x: 870, y: 90, rotate: -110, color: "#ffc20e" },
          ].map((leaf) => (
            <g key={leaf.x} transform={`translate(${leaf.x} ${leaf.y - 8}) rotate(${leaf.rotate})`}>
              <motion.path
                d="M0 0 C 4 -16, 16 -26, 30 -26 C 30 -12, 18 -2, 0 0 Z"
                fill={leaf.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
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
