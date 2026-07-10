"use client";

import { motion } from "motion/react";
import { LeafShape } from "./icons";

export default function PsychologyHero() {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-teal/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blossom/10 blur-3xl" />
        <LeafShape className="animate-float absolute left-[9%] top-28 h-8 w-8 text-white/5" />
        <LeafShape className="animate-float absolute right-[12%] top-44 h-10 w-10 rotate-45 text-white/5 [animation-delay:-3s]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50"
        >
          Psychologie d&rsquo;entreprise
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Compatible —{" "}
          <span className="bg-gradient-to-r from-leaf via-teal to-sky bg-clip-text text-transparent">
            pas juste similaire
          </span>
          .
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/65"
        >
          Une transmission échoue rarement sur les chiffres. Elle échoue sur
          la relation. C&rsquo;est pour ça que le score de compatibilité de
          Nedexia ne s&rsquo;arrête pas aux chiffres.
        </motion.p>
      </div>
    </section>
  );
}
