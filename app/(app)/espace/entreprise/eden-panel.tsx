"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import symbole from "@/public/symbole-eden.png";
import { useEspace, type GeneratedDoc } from "./espace-context";

/**
 * Le panneau Eden — conseiller persistant, présent sur toutes les pages de
 * l'espace (comme le panneau d'activité de Linear). Pas de bulles de chat :
 * la voix d'Eden est une prose serif signée, les réponses du dirigeant sont
 * des notes encartées clairement attribuées. Le panneau lit le contexte de
 * la page active via le provider (send → pageContext).
 */

/** Voix d'Eden : serif chaleureuse, prose aérée — rien d'un chatbot. */
const EDEN_PROSE =
  "font-eden text-[1rem] leading-[1.7] text-ink/90 [&_strong]:font-semibold [&_strong]:text-ink [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1";

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="Eden écrit">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/30" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/30 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/30 [animation-delay:300ms]" />
    </span>
  );
}

/**
 * Révélation douce du texte streamé : le contenu arrive en tampon, l'écran le
 * pose à un rythme régulier avec une micro-respiration aux fins de phrases —
 * la cadence d'un homme qui parle, pas d'un modèle qui débite.
 */
function useSmoothText(target: string, live: boolean): string {
  const [animated] = useState(live);
  const [shown, setShown] = useState(() => (live ? "" : target));
  const targetRef = useRef(target);
  const liveRef = useRef(live);

  useEffect(() => {
    targetRef.current = target;
    liveRef.current = live;
  }, [target, live]);

  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    let pauseUntil = 0;
    let len = 0;
    const step = (t: number) => {
      const full = targetRef.current.length;
      if (len >= full) {
        if (liveRef.current) raf = requestAnimationFrame(step);
        return;
      }
      if (t >= pauseUntil) {
        const lag = full - len;
        const chars = Math.max(1, Math.min(26, Math.round(lag / 14)));
        len = Math.min(full, len + chars);
        const ch = targetRef.current[len - 1];
        if (ch === "." || ch === "!" || ch === "?" || ch === "…") {
          pauseUntil = t + 150;
        }
        setShown(targetRef.current.slice(0, len));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return animated ? shown : target;
}

function EdenProse({ text, live }: { text: string; live: boolean }) {
  const shown = useSmoothText(text, live);
  return <Streamdown className={EDEN_PROSE}>{shown}</Streamdown>;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  one_pager: "Fiche synthèse",
  action_plan: "Plan d'action",
  prep_note: "Note de préparation",
  custom: "Document",
};

/** Carte livrable : un document rédigé par Eden se matérialise dans le fil. */
function DeliverableCard({ doc }: { doc: GeneratedDoc }) {
  const [open, setOpen] = useState(false);

  const download = () => {
    const blob = new Blob([doc.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-ink/15 bg-parchment">
      <div aria-hidden className="h-[3px] bg-brass/70" />
      <div className="flex items-center gap-3 p-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/12 bg-parchment text-moss">
          <svg
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{doc.title}</p>
          <p className="text-xs text-ink-soft">
            {DOC_TYPE_LABELS[doc.type] ?? "Document"} · rédigé par Eden
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="border border-ink/20 bg-parchment px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-rust hover:text-rust"
          >
            {open ? "Replier" : "Lire"}
          </button>
          <button
            type="button"
            onClick={download}
            className="bg-ink px-3 py-1.5 text-xs font-semibold text-parchment transition-colors hover:bg-[#232e3d]"
          >
            Télécharger
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto border-t border-ink/10 bg-parchment-deep/40 px-4 py-4">
              <Streamdown className={EDEN_PROSE}>{doc.markdown}</Streamdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EdenPanel() {
  const {
    displayName,
    dateLabel,
    hasDiagnostic,
    messages,
    streaming,
    checkinStreaming,
    checkinText,
    status,
    error,
    send,
    closeEden,
  } = useEspace();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootScroll = useRef(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: bootScroll.current ? "instant" : "smooth",
    });
    bootScroll.current = false;
  }, [messages, checkinText, streaming]);

  const showEmptyConversation = messages.length === 0 && !checkinStreaming;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* En-tête */}
      <div className="flex shrink-0 items-center gap-3 border-b border-ink/15 px-5 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/12 bg-parchment p-1.5">
          <Image src={symbole} alt="" className="h-auto w-full" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brass">
            Eden · Conseiller
          </p>
          <p className="truncate text-sm font-medium text-ink">
            Point d&rsquo;étape · {dateLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={closeEden}
          aria-label="Fermer le panneau Eden"
          title="Fermer (⌘E)"
          className="flex h-8 w-8 items-center justify-center text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Le fil */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 px-5 py-6">
          {showEmptyConversation && (
            <div className="border border-ink/12 bg-parchment-deep/30 px-5 py-6 text-center">
              <p className="font-eden text-base text-ink">
                {hasDiagnostic ? `Bonjour ${displayName}.` : `Bienvenue, ${displayName}.`}
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
                {hasDiagnostic
                  ? "Dites-moi où vous en êtes, ou posez-moi une question sur votre dossier."
                  : "Faites votre diagnostic depuis l'accueil — je bâtirai ensuite votre dossier avec vous."}
              </p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex flex-col items-end gap-1">
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-soft/60">
                  Vous
                </span>
                <div className="max-w-[88%] whitespace-pre-wrap border-l-2 border-ink/30 bg-parchment-deep/40 px-4 py-2.5 text-[0.92rem] leading-relaxed text-ink">
                  {m.content}
                </div>
              </div>
            ) : m.doc ? (
              <DeliverableCard key={i} doc={m.doc} />
            ) : (
              <div key={i}>
                {m.content ? (
                  <>
                    <EdenProse
                      text={m.content}
                      live={streaming && i === messages.length - 1}
                    />
                    {!(streaming && i === messages.length - 1) && (
                      <div className="mt-2.5 flex items-center gap-2" aria-hidden>
                        <span className="h-px w-6 bg-ink/20" />
                        <span className="font-eden text-xs italic text-brass">Eden</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <TypingDots />
                    <AnimatePresence mode="wait">
                      {status && (
                        <motion.span
                          key={status}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.25 }}
                          className="font-eden text-sm italic text-ink-soft"
                        >
                          {status}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )
          )}

          {checkinStreaming && (
            <div>
              {checkinText ? (
                <EdenProse text={checkinText} live />
              ) : (
                <div className="flex items-center gap-2.5">
                  <TypingDots />
                  <span className="font-eden text-sm italic text-ink-soft">
                    Eden prépare votre point d&rsquo;étape…
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="shrink-0 border-t border-rust/20 bg-rust/5 px-5 py-2 text-xs text-rust">
          {error}
        </p>
      )}

      {/* Composer */}
      <div className="shrink-0 border-t border-ink/15 px-5 py-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
            setInput("");
          }}
          className="flex w-full items-center gap-2.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={checkinStreaming ? "Eden écrit…" : "Répondre à Eden…"}
            disabled={streaming || checkinStreaming}
            className="min-w-0 flex-1 border border-ink/20 bg-parchment px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink/45 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={streaming || checkinStreaming || !input.trim()}
            aria-label="Envoyer"
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-parchment transition-colors hover:bg-[#232e3d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
