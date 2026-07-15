"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode[];
  options?: EmblaOptionsType;
  /** Affiche les puces d'étape (filets d'encre, pas des pastilles SaaS) */
  showDots?: boolean;
  /** Affiche flèches Précédent / Suivant */
  showArrows?: boolean;
  className?: string;
  /** Notifie l'index actif (pour synchroniser un instrument externe) */
  onSelect?: (index: number) => void;
  /** Contrôle externe optionnel */
  selectedIndex?: number;
  /** parchment = pages claires · ink = sections sombres */
  tone?: "parchment" | "ink";
};

/**
 * Carrousel Nedexia — Embla sous le capot, langage carnet de terrain
 * au-dessus : pas de flèches rondes ni de dots glass.
 */
export function LedgerCarousel({
  children,
  options = { loop: true, align: "start" },
  showDots = true,
  showArrows = true,
  className,
  onSelect,
  selectedIndex: controlledIndex,
  tone = "parchment",
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [index, setIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const muted =
    tone === "ink"
      ? "text-parchment/50 hover:text-parchment disabled:opacity-30"
      : "text-ink-soft hover:text-ink disabled:opacity-30";
  const dotIdle = tone === "ink" ? "bg-parchment/25 hover:bg-parchment/45" : "bg-ink/20 hover:bg-ink/40";
  const dotActive = "bg-rust";

  const sync = useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    setIndex(i);
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    onSelect?.(i);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, sync]);

  useEffect(() => {
    if (controlledIndex === undefined || !emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== controlledIndex) {
      emblaApi.scrollTo(controlledIndex);
    }
  }, [controlledIndex, emblaApi]);

  return (
    <div className={cn("relative", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {children.map((child, i) => (
            <div
              key={i}
              className="min-w-0 shrink-0 grow-0 basis-full"
              style={{ paddingRight: "0.5rem" }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {(showArrows || showDots) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          {showArrows ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev && !options.loop}
                className={cn(
                  "text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  muted
                )}
              >
                ← Préc.
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext && !options.loop}
                className={cn(
                  "text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  muted
                )}
              >
                Suiv. →
              </button>
            </div>
          ) : (
            <span />
          )}

          {showDots ? (
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Diapositives">
              {children.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Aller à la diapositive ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === index ? `w-8 ${dotActive}` : `w-3 ${dotIdle}`
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
