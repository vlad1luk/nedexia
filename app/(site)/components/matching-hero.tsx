"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { LedgerLink } from "./ledger-link";
import PhoneFrame from "./phone-frame";

/**
 * Héro Matching — composition centrée (pas texte|image), fond encre plat.
 * L'italique rouille porte « Voici la récolte. » — seul accent de risque
 * du héro. Le téléphone émerge du bas comme spécimen, sans halo pastel.
 */
export default function MatchingHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink">
      <div className="relative mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center px-4 pt-20 text-center sm:px-6 sm:pt-24">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mx-auto flex w-fit items-center gap-3 border-b border-parchment/20 pb-3"
          >
            <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-brass">
              N&deg;03
            </span>
            <span className="h-3 w-px bg-parchment/20" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-parchment/55">
              Matching · Application mobile Nedexia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mt-8 text-balance font-[family-name:var(--font-fraunces)] text-[2.6rem] font-medium leading-[1.05] tracking-tight text-parchment sm:text-6xl lg:text-[4.25rem]"
          >
            Vous avez cultivé.
            <br />
            <span className="italic text-rust">Voici la récolte.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-relaxed text-parchment/65 sm:text-xl"
          >
            La mise en relation d’affaires réservée aux entreprises jugées
            prêtes par Eden. S’allier, céder, acquérir ou investir : la
            rencontre qui couronne le parcours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4"
          >
            <LedgerLink href="/eden" tone="light">
              Commencer avec Eden
            </LedgerLink>
            <a
              href="#decouvrir"
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide text-parchment/70 transition-colors hover:text-parchment"
            >
              Découvrir l’application
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
        </motion.div>

        <motion.div
          style={{ y: phoneY }}
          className="relative mt-14 h-72 w-52 sm:mt-16 sm:h-[26rem] sm:w-72"
        >
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="absolute inset-x-0 top-0"
          >
            <PhoneFrame
              className="relative ring-1 ring-parchment/15"
              label="La carte d’entreprise dans l’application"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
