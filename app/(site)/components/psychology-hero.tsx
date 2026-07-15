"use client";

import { motion } from "motion/react";

/**
 * Héro Psychologie — composition centrée, fond encre.
 * L'italique rouille porte « pas juste similaire » : compatible ≠ clone.
 */
export default function PsychologyHero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto flex w-fit items-center gap-3 border-b border-parchment/20 pb-3"
        >
          <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
            N&deg;04
          </span>
          <span className="h-3 w-px bg-parchment/20" />
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-parchment/55">
            Psychologie d&rsquo;entreprise
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
          className="mt-8 text-balance font-[family-name:var(--font-fraunces)] text-[2.5rem] font-medium leading-[1.08] tracking-tight text-parchment sm:text-5xl lg:text-[3.75rem]"
        >
          Compatible —{" "}
          <span className="italic text-rust">pas juste similaire</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-parchment/65"
        >
          Une transmission échoue rarement sur les chiffres. Elle échoue sur
          la relation. C&rsquo;est pour ça que le score de compatibilité de
          Nedexia ne s&rsquo;arrête pas aux chiffres.
        </motion.p>
      </div>
    </section>
  );
}
