"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useRef } from "react";

/**
 * « L'arbre d'Eden » — section signature de /eden, épinglée au scroll.
 *
 * La section se fige le temps de ~2,6 écrans : l'arbre 3D (voir
 * croissance-scene.tsx) pousse de la graine à l'arbre mature en
 * tournant lentement, feuillage animé par le vent. Le geste est
 * réversible — remonter fait rajeunir l'arbre. Aucun chiffre, aucun
 * jalon : le titre s'efface quand la pousse commence, une conclusion
 * apparaît quand la canopée est pleine.
 *
 * Pilotage : GSAP ScrollTrigger (pin + scrub) écrit la progression
 * dans une ref que la boucle de rendu R3F lit à chaque frame — aucun
 * re-render React pendant le scroll.
 */

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CroissanceScene = dynamic(() => import("./croissance-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[#565c8c]">
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
        gsap.set(".cr-progress-fill", { scaleY: 1 });
        gsap.set(".cr-horizon", { scaleX: 1 });
        return;
      }

      gsap.set(".cr-phase-one", { autoAlpha: 0, y: 24 });
      gsap.set(".cr-phase-two", { autoAlpha: 0, y: 24 });
      gsap.set(".cr-outro", { autoAlpha: 0, y: 14 });
      gsap.set(".cr-progress-fill", { scaleY: 0, transformOrigin: "top" });
      gsap.set(".cr-horizon", { scaleX: 0, transformOrigin: "center" });
      gsap.set(".cr-lens", { scale: 0.72, autoAlpha: 0.18 });

      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "+=340%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          gsap.set(".cr-intro", {
            autoAlpha: 1 - Math.min(1, p / 0.13),
            y: p * -72,
          });

          const phaseOneIn = Math.min(1, Math.max(0, (p - 0.16) / 0.09));
          const phaseOneOut = 1 - Math.min(1, Math.max(0, (p - 0.4) / 0.1));
          const phaseOne = phaseOneIn * phaseOneOut;
          gsap.set(".cr-phase-one", {
            autoAlpha: phaseOne,
            y: 24 * (1 - phaseOne),
          });

          const phaseTwoIn = Math.min(1, Math.max(0, (p - 0.48) / 0.09));
          const phaseTwoOut = 1 - Math.min(1, Math.max(0, (p - 0.75) / 0.09));
          const phaseTwo = phaseTwoIn * phaseTwoOut;
          gsap.set(".cr-phase-two", {
            autoAlpha: phaseTwo,
            y: 24 * (1 - phaseTwo),
          });

          const o = Math.min(1, Math.max(0, (p - 0.83) / 0.1));
          gsap.set(".cr-outro", { autoAlpha: o, y: 14 * (1 - o) });
          gsap.set(".cr-progress-fill", { scaleY: p });
          gsap.set(".cr-horizon", { scaleX: Math.min(1, p * 1.8) });
          gsap.set(".cr-lens", {
            scale: 0.72 + p * 0.48,
            autoAlpha: 0.18 + p * 0.42,
            rotate: p * 32,
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
      className="relative h-svh overflow-hidden bg-[#050711] text-[#f7f8ff]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 58% at 50% 4%, rgba(58,55,143,0.24), transparent 68%), radial-gradient(56% 46% at 50% 88%, rgba(34,185,220,0.18), transparent 72%), linear-gradient(180deg, #080826 0%, #07131c 48%, #02070a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:radial-gradient(ellipse_76%_78%_at_50%_50%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-22rem] left-1/2 h-[48rem] w-[145%] opacity-55 [background-image:linear-gradient(rgba(34,185,220,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(34,185,220,0.07)_1px,transparent_1px)] [background-size:72px_72px]"
        style={{
          transform: "translateX(-50%) perspective(820px) rotateX(66deg)",
        }}
      />
      <div
        aria-hidden
        className="cr-lens pointer-events-none absolute left-1/2 top-[53%] h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#22b9dc]/16 shadow-[0_0_100px_rgba(34,185,220,0.08)] sm:h-[56rem] sm:w-[56rem]"
      >
        <span className="absolute inset-[8%] rounded-full border border-dashed border-[#5551a8]/16" />
        <span className="absolute inset-[20%] rounded-full border border-white/[0.055]" />
      </div>
      <div aria-hidden className="cr-horizon pointer-events-none absolute left-1/2 top-[57%] h-px w-[76%] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(34,185,220,0.75),rgba(85,81,168,0.72),transparent)] shadow-[0_0_24px_rgba(34,185,220,0.35)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-gradient-to-b from-[#050711] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-[#04080f] via-[#04080f]/55 to-transparent" />

      <CroissanceScene progress={progress} />

      <div className="cr-intro pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[96rem] flex-col items-start px-5 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36">
        <h2 className="max-w-5xl text-balance text-[clamp(3.2rem,7vw,7.5rem)] font-semibold leading-[0.86] tracking-[-0.078em]">
          Une entreprise ne grandit pas
          <br />
          en ligne droite.
          <br />
          <span className="text-[#64cbe6]">Elle grandit par sa structure.</span>
        </h2>
        <p className="mt-7 max-w-lg text-base leading-relaxed text-[#aab2ce] sm:text-lg">
          Faites défiler. Les racines apparaissent, la structure se déploie,
          puis l’ensemble commence à respirer.
        </p>
        <span className="mt-10 h-20 w-px bg-gradient-to-b from-[#22b9dc] to-transparent motion-safe:animate-pulse" />
      </div>

      <div className="cr-phase-one pointer-events-none absolute left-0 top-[22%] z-20 max-w-[22rem] px-5 sm:px-8 lg:top-1/2 lg:max-w-[28rem] lg:-translate-y-1/2 lg:px-12">
        <p className="text-balance text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-[#e6e9f5] sm:text-3xl lg:text-5xl">
          Sous la surface,
          <br />
          <span className="text-[#22b9dc]">tout commence par des racines.</span>
        </p>
      </div>

      <div className="cr-phase-two pointer-events-none absolute right-0 top-[20%] z-20 ml-auto max-w-[22rem] px-5 text-right sm:px-8 lg:top-1/2 lg:max-w-[31rem] lg:-translate-y-1/2 lg:px-12">
        <p className="text-balance text-2xl font-medium leading-[1.02] tracking-[-0.05em] text-[#e6e9f5] sm:text-3xl lg:text-5xl">
          Chaque branche
          <br />
          <span className="text-[#64cbe6]">renforce l’ensemble.</span>
        </p>
      </div>

      <div className="cr-outro pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-5 pb-14 text-center sm:pb-16">
        <p className="max-w-5xl text-balance text-3xl font-medium leading-[0.96] tracking-[-0.06em] text-[#f7f8ff] sm:text-5xl lg:text-7xl">
          Ce qui est relié
          <br />
          <span className="text-[#64cbe6]">devient capable de grandir.</span>
        </p>
      </div>

      <div aria-hidden className="pointer-events-none absolute right-6 top-1/2 z-30 hidden h-40 w-px -translate-y-1/2 overflow-hidden bg-white/10 md:block">
        <span className="cr-progress-fill absolute inset-x-0 top-0 h-full bg-[linear-gradient(to_bottom,#22b9dc,#5551a8)] shadow-[0_0_14px_rgba(34,185,220,0.5)]" />
      </div>
    </section>
  );
}
