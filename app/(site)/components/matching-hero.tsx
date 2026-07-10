"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { LeafShape } from "./icons";
import PhoneFrame from "./phone-frame";

export default function MatchingHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy-deep">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-teal/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-sky/10 blur-3xl" />
        <LeafShape className="animate-float absolute left-[8%] top-36 h-8 w-8 text-white/5" />
        <LeafShape className="animate-float absolute right-[11%] top-52 h-11 w-11 rotate-45 text-white/5 [animation-delay:-3s]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center px-4 pt-24 text-center sm:px-6 sm:pt-28">
        <motion.div style={{ y: textY, opacity: textOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50"
          >
            Matching · L’application mobile Nedexia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
            className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Vous avez cultivé.
            <br />
            <span className="bg-gradient-to-r from-leaf via-teal to-sky bg-clip-text text-transparent">
              Voici la récolte.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: "easeOut" }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl"
          >
            La mise en relation d’affaires réservée aux entreprises jugées
            prêtes par Eden. S’allier, céder, acquérir ou investir : la
            rencontre qui couronne le parcours.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            <Link
              href="/eden"
              className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-navy-deep shadow-lg shadow-black/25 transition-all hover:-translate-y-0.5 hover:bg-leaf"
            >
              Commencer avec Eden
            </Link>
            <a
              href="#decouvrir"
              className="group inline-flex items-center gap-2 text-base font-semibold text-white/75 transition-colors hover:text-white"
            >
              Découvrir l’application
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-y-0.5">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Téléphone rogné au bas du héro, parallaxe au défilement */}
        <motion.div style={{ y: phoneY }} className="relative mt-16 h-80 w-60 sm:h-[26rem] sm:w-72">
          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45, ease: "easeOut" }}
            className="absolute inset-x-0 top-0"
          >
            <div className="pointer-events-none absolute -inset-x-20 -top-12 h-80 rounded-full bg-teal/25 blur-[90px]" aria-hidden="true" />
            <PhoneFrame className="relative ring-1 ring-white/15">
              <video
                src="/cardEntrepriseVideo.MP4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="La carte d’entreprise dans l’application"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </PhoneFrame>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
