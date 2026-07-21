"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useRef } from "react";

/**
 * Section signature d'Eden : un arbre naturel se développe avec le scroll.
 * La scène 3D est générée une seule fois; le scroll ne fait ensuite varier
 * que son échelle, son feuillage et la caméra afin de rester fluide.
 */

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CroissanceScene = dynamic(() => import("./croissance-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#52675c]">
        Le jardin s’éveille…
      </span>
    </div>
  ),
});

export default function Croissance() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        progress.current = 1;
        gsap.set(".cr-intro", { autoAlpha: 0 });
        gsap.set(".cr-phase-one", { autoAlpha: 0 });
        gsap.set(".cr-phase-two", { autoAlpha: 0 });
        gsap.set(".cr-outro", { autoAlpha: 1 });
        return;
      }

      gsap.set(".cr-phase-one", { autoAlpha: 0, y: 24 });
      gsap.set(".cr-phase-two", { autoAlpha: 0, y: 24 });
      gsap.set(".cr-outro", { autoAlpha: 0, y: 14 });

      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "+=280%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const value = self.progress;
          progress.current = value;
          gsap.set(".cr-intro", {
            autoAlpha: 1 - Math.min(1, value / 0.13),
            y: value * -72,
          });

          const phaseOneIn = Math.min(1, Math.max(0, (value - 0.16) / 0.09));
          const phaseOneOut =
            1 - Math.min(1, Math.max(0, (value - 0.4) / 0.1));
          const phaseOne = phaseOneIn * phaseOneOut;
          gsap.set(".cr-phase-one", {
            autoAlpha: phaseOne,
            y: 24 * (1 - phaseOne),
          });

          const phaseTwoIn = Math.min(1, Math.max(0, (value - 0.48) / 0.09));
          const phaseTwoOut =
            1 - Math.min(1, Math.max(0, (value - 0.75) / 0.09));
          const phaseTwo = phaseTwoIn * phaseTwoOut;
          gsap.set(".cr-phase-two", {
            autoAlpha: phaseTwo,
            y: 24 * (1 - phaseTwo),
          });

          const outro = Math.min(1, Math.max(0, (value - 0.83) / 0.1));
          gsap.set(".cr-outro", {
            autoAlpha: outro,
            y: 14 * (1 - outro),
          });
        },
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="croissance"
      className="relative h-svh overflow-hidden bg-[#dce6df] text-[#203029]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 52% at 78% 8%, rgba(255,243,205,0.9), transparent 72%), linear-gradient(180deg, #dce9ed 0%, #dce7df 48%, #a5b197 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[4%] top-[3%] h-56 w-56 rounded-full blur-3xl sm:h-80 sm:w-80"
        style={{
          background:
            "radial-gradient(circle, rgba(255,249,224,0.9), rgba(255,232,170,0.24) 42%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#eef3f8]/65 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-[#829076]/70 via-[#95a489]/20 to-transparent"
      />

      <CroissanceScene progress={progress} />

      <div className="cr-intro pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[96rem] flex-col items-start px-5 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36">
        <h2 className="max-w-5xl text-balance text-[clamp(3.2rem,7vw,7.5rem)] font-semibold leading-[0.86] tracking-[-0.078em]">
          Une entreprise ne grandit pas
          <br />
          en ligne droite.
          <br />
          <span className="text-[#326b52]">Elle grandit par sa structure.</span>
        </h2>
        <p className="mt-7 max-w-lg text-base leading-relaxed text-[#51675c] sm:text-lg">
          Faites défiler. Le tronc s’élève, la canopée se déploie, puis
          l’ensemble prend naturellement sa place.
        </p>
        <span className="mt-10 h-20 w-px bg-gradient-to-b from-[#326b52] to-transparent motion-safe:animate-pulse" />
      </div>

      <div className="cr-phase-one pointer-events-none absolute left-0 top-[22%] z-20 max-w-[22rem] px-5 sm:px-8 lg:top-1/2 lg:max-w-[28rem] lg:-translate-y-1/2 lg:px-12">
        <p className="text-balance text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-[#263b31] [text-shadow:0_2px_18px_rgba(235,242,236,0.9)] sm:text-3xl lg:text-5xl">
          Sous la surface,
          <br />
          <span className="text-[#326b52]">tout commence par des racines.</span>
        </p>
      </div>

      <div className="cr-phase-two pointer-events-none absolute right-0 top-[20%] z-20 ml-auto max-w-[22rem] px-5 text-right sm:px-8 lg:top-1/2 lg:max-w-[31rem] lg:-translate-y-1/2 lg:px-12">
        <p className="text-balance text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-[#263b31] [text-shadow:0_2px_18px_rgba(235,242,236,0.9)] sm:text-3xl lg:text-5xl">
          Chaque branche
          <br />
          <span className="text-[#326b52]">renforce l’ensemble.</span>
        </p>
      </div>

      <div className="cr-outro pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-5 pb-14 text-center sm:pb-16">
        <p className="max-w-5xl text-balance text-3xl font-medium leading-[0.96] tracking-[-0.06em] text-[#f7faf7] [text-shadow:0_3px_22px_rgba(31,48,41,0.36)] sm:text-5xl lg:text-7xl">
          Ce qui est relié
          <br />
          <span className="text-[#e2f0df]">devient capable de grandir.</span>
        </p>
      </div>
    </section>
  );
}
