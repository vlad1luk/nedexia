"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const resources = [
  {
    kind: "Guide",
    title: "Le financement ne commence pas par une demande.",
    mark: "10′",
    background: "#e9efff",
    foreground: "#1b2327",
    accent: "#5966e8",
  },
  {
    kind: "Méthode",
    title: "Les preuves qu’un financeur cherche vraiment.",
    mark: "70+",
    background: "#e7f2ea",
    foreground: "#1b2327",
    accent: "#67b879",
  },
  {
    kind: "Analyse",
    title: "Pourquoi les PME sous-estiment leur admissibilité.",
    mark: "4",
    background: "#ececf0",
    foreground: "#1b2327",
    accent: "#8a7cf3",
  },
  {
    kind: "Lecture",
    title: "Rendre vos chiffres utiles à une décision.",
    mark: "→",
    background: "#f1eadb",
    foreground: "#1b2327",
    accent: "#c98b50",
  },
];

export default function HomeResources() {
  const [active, setActive] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5200, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

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

  const goTo = (index: number) => emblaApi?.scrollTo(index);

  return (
    <section id="ressources" className="overflow-hidden bg-[#171d20] text-[#f7f8f6]">
      <div className="mx-auto max-w-[92rem] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.19em] text-[#a9b0ae]">Ressources Nedexia</p>
            <h2 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.065em] sm:text-6xl">
              Pour comprendre ce qui rend une entreprise finançable.
            </h2>
          </div>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="group inline-flex shrink-0 items-center gap-3 self-start border border-[#f7f8f6]/55 px-4 py-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#f7f8f6] transition-colors hover:border-[#aeb5ff] hover:text-[#aeb5ff] sm:self-end"
          >
            Voir toutes les ressources
            <span className="text-base text-[#aeb5ff] transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div ref={emblaRef} className="mt-14 overflow-visible">
          <div className="-ml-4 flex touch-pan-y">
            {resources.map((resource) => (
              <article key={resource.title} className="min-w-0 shrink-0 grow-0 basis-[86%] pl-4 sm:basis-[48%] lg:basis-[30%]">
                <a
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="group block"
                  aria-label={`${resource.kind}: ${resource.title}`}
                >
                  <div
                    className="relative aspect-[1.38] overflow-hidden rounded-[0.9rem] border border-white/10"
                    style={{ backgroundColor: resource.background, color: resource.foreground }}
                  >
                    <div className="absolute inset-5 border" style={{ borderColor: `${resource.accent}50` }} />
                    <div
                      className="absolute -bottom-16 -right-14 h-56 w-56 rounded-full border-[26px] transition-transform duration-700 group-hover:translate-x-4 group-hover:-translate-y-3"
                      style={{ borderColor: resource.accent }}
                    />
                    <div className="absolute left-7 top-7 text-[0.58rem] font-bold uppercase tracking-[0.18em]" style={{ color: resource.accent }}>
                      {resource.kind} / Nedexia
                    </div>
                    <p className="absolute bottom-5 left-7 font-mono text-[clamp(4rem,9vw,7rem)] font-medium leading-none tracking-[-0.12em] transition-transform duration-700 group-hover:-translate-y-2">
                      {resource.mark}
                    </p>
                  </div>
                  <div className="flex items-start justify-between gap-5 border-b border-white/20 py-5">
                    <h3 className="max-w-xs text-xl font-medium leading-[1.04] tracking-[-0.04em] text-[#f7f8f6] sm:text-2xl">{resource.title}</h3>
                    <span className="mt-1 text-xl text-[#aeb5ff] transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-6">
          <div className="h-px flex-1 bg-white/15">
            <motion.div
              className="h-full origin-left bg-[#aeb5ff]"
              animate={{ scaleX: (active + 1) / resources.length }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Ressource précédente" onClick={() => emblaApi?.scrollPrev()} className="text-xl text-[#f7f8f6] transition-colors hover:text-[#aeb5ff]">←</button>
            <button type="button" aria-label="Ressource suivante" onClick={() => emblaApi?.scrollNext()} className="text-xl text-[#f7f8f6] transition-colors hover:text-[#aeb5ff]">→</button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Sélection des ressources">
          {resources.map((resource, index) => (
            <button
              key={resource.title}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Afficher ${resource.title}`}
              onClick={() => goTo(index)}
              className={`h-1.5 transition-all duration-300 ${index === active ? "w-14 bg-[#aeb5ff]" : "w-5 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
