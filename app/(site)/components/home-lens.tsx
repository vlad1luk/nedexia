"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const readings = [
  {
    name: "Le potentiel",
    title: "Votre projet a déjà une valeur. Il faut la formuler dans le langage du financement.",
    detail: "Nedexia commence par isoler les éléments qui comptent vraiment pour un programme ou un partenaire.",
    score: 42,
    accent: "#5966e8",
  },
  {
    name: "La préparation",
    title: "Le financement se débloque quand vos chiffres racontent la même histoire que votre ambition.",
    detail: "Nous repérons les preuves manquantes, les angles forts et les décisions qui augmentent votre admissibilité.",
    score: 58,
    accent: "#8a7cf3",
  },
  {
    name: "L’accès",
    title: "À 70+, votre entreprise n’est plus seulement prometteuse. Elle devient lisible pour les bonnes conversations.",
    detail: "Programmes, institutions, partenaires et investisseurs peuvent enfin se connecter à un dossier défendable.",
    score: 74,
    accent: "#67b879",
  },
];

function ScoreLine({ score, accent }: { score: number; accent: string }) {
  return (
    <div className="relative mt-10 h-11 w-full max-w-[42rem]">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#cfd6d3]" />
      <motion.div
        className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 origin-left"
        animate={{ width: `${score}%`, backgroundColor: accent }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="absolute left-[70%] top-0 h-full w-px bg-[#657074]" />
      <span className="absolute left-[70%] bottom-0 -translate-x-1/2 font-mono text-[0.62rem] text-[#657074]">70</span>
      <motion.div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ left: `${score}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="absolute -inset-3 rounded-full border" style={{ borderColor: `${accent}40` }} />
        <span className="relative block h-3 w-3 rounded-full border-2 border-[#f7f8f6]" style={{ backgroundColor: accent }} />
      </motion.div>
    </div>
  );
}

export default function HomeLens() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 4800, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 110, damping: 24, mass: 0.7 });
  const springY = useSpring(pointerY, { stiffness: 110, damping: 24, mass: 0.7 });
  const rotateX = useTransform(springY, [0, 1], reduce ? [0, 0] : [1.5, -1.5]);
  const rotateY = useTransform(springX, [0, 1], reduce ? [0, 0] : [-1.5, 1.5]);

  const sync = useCallback(() => {
    if (emblaApi) setActive(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, sync]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const reading = readings[active] ?? readings[0];

  return (
    <div className="relative" onPointerMove={handlePointerMove}>
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1400 }}
        className="relative overflow-hidden border border-[#d9dfdc] bg-[#f7f8f6] shadow-[0_20px_60px_rgba(32,41,43,0.07)]"
      >
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {readings.map((item) => (
              <article key={item.name} className="min-w-0 shrink-0 grow-0 basis-full px-5 py-12 sm:px-12 sm:py-16 lg:px-24 lg:py-20">
                <AnimatePresence mode="wait" initial={false}>
                  {item.name === reading.name ? (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="mx-auto flex max-w-4xl flex-col items-center text-center"
                    >
                      <div className="mt-7 flex items-end gap-3">
                        <motion.span
                          key={item.score}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.55, delay: 0.08 }}
                          className="font-mono text-[clamp(4.5rem,11vw,8.8rem)] font-medium leading-[0.8] tracking-[-0.12em]"
                          style={{ color: item.accent }}
                        >
                          {item.score}
                        </motion.span>
                        <span className="mb-1 text-sm text-[#697478]">sur 100</span>
                      </div>
                      <ScoreLine score={item.score} accent={item.accent} />
                      <h2 className="mt-12 max-w-3xl text-balance text-2xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#1b2327] sm:text-4xl lg:text-5xl">{item.title}</h2>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#697478] sm:text-base">{item.detail}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[#d9dfdc] px-5 py-4" role="tablist" aria-label="Étapes du score">
          {readings.map((item, index) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={item.name}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-300 ${index === active ? "w-12 bg-[#5966e8]" : "w-2 bg-[#cfd6d3] hover:bg-[#8a9596]"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
