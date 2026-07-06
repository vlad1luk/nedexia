"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import symbole from "@/public/symbole-eden.png";
import { isOpen, type Task } from "@/lib/espace/tasks";
import type { Tier } from "@/lib/espace/types";
import { updateTask } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/client";
import { DocumentsDock, type DocItem } from "./documents-dock";
import { ScoreVitals } from "./score-vitals";
import { WeekPanel } from "./week-panel";

type Message = { role: "user" | "assistant"; content: string };
type Score = { total: number; tier: Tier } | null;
type Mode = "etape" | "seance";

const TIER_STYLES: Record<Tier, string> = {
  rouge: "bg-coral/10 text-coral",
  orange: "bg-sun/20 text-navy",
  jaune: "bg-sun/15 text-navy",
  vert: "bg-leaf/15 text-leaf-deep",
};

/** Voix d'Eden : serif chaleureuse, prose aérée — rien d'un chatbot. */
const EDEN_PROSE =
  "font-eden text-[1.02rem] leading-[1.75] text-foreground/85 [&_strong]:font-semibold [&_strong]:text-navy [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground/45">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-leaf" />
      {children}
    </h2>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="Eden écrit">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30 [animation-delay:300ms]" />
    </span>
  );
}

function EdenAvatar({
  size = "h-9 w-9",
  glow = false,
}: {
  size?: string;
  glow?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      {glow && (
        <motion.span
          aria-hidden
          className="absolute -inset-2 rounded-full bg-gradient-to-br from-leaf/40 to-teal/40 blur-md"
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span
        className={`relative flex ${size} items-center justify-center rounded-full border border-navy/10 bg-white p-1.5 shadow-sm`}
      >
        <Image src={symbole} alt="" className="h-auto w-full" />
      </span>
    </span>
  );
}

export default function Workspace({
  displayName,
  dateLabel,
  score: initialScore,
  scoreSeries,
  hasDiagnostic,
  initialTasks,
  initialDocs,
  initialConversationId,
  initialMessages,
  needsCheckin,
}: {
  displayName: string;
  dateLabel: string;
  score: Score;
  scoreSeries: number[];
  hasDiagnostic: boolean;
  initialTasks: Task[];
  initialDocs: DocItem[];
  initialConversationId: string | null;
  initialMessages: Message[];
  needsCheckin: boolean;
}) {
  const [mode, setMode] = useState<Mode>("etape");
  const [convId, setConvId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [score, setScore] = useState<Score>(initialScore);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [weekOpen, setWeekOpen] = useState(false);

  // Le brief : le point d'étape affiché en tête du cahier.
  const lastAssistant =
    [...initialMessages].reverse().find((m) => m.role === "assistant")
      ?.content ?? null;
  const [brief, setBrief] = useState<string>(
    needsCheckin ? "" : (lastAssistant ?? "")
  );
  const [briefStreaming, setBriefStreaming] = useState(needsCheckin);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkinRan = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootScroll = useRef(true);

  const briefFallback =
    lastAssistant ??
    `Bienvenue ${displayName}. Dites-moi où vous en êtes — on avance un pas à la fois.`;

  // ─── Eden ouvre la séance : point d'étape généré et streamé ───
  useEffect(() => {
    if (!needsCheckin || checkinRan.current) return;
    checkinRan.current = true;

    (async () => {
      let text = "";
      try {
        const res = await fetch("/api/eden/checkin", { method: "POST" });
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || contentType.includes("application/json")) {
          setBrief(briefFallback);
          setBriefStreaming(false);
          return;
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload) continue;
            let evt: {
              type?: string;
              text?: string;
              conversationId?: string;
            };
            try {
              evt = JSON.parse(payload);
            } catch {
              continue;
            }
            if (evt.type === "meta" && evt.conversationId) {
              setConvId(evt.conversationId);
            } else if (evt.type === "delta" && evt.text) {
              text += evt.text;
              setBrief(text);
            }
          }
        }
        if (text.trim()) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: text.trim() },
          ]);
        } else {
          setBrief(briefFallback);
        }
      } catch {
        setBrief(briefFallback);
      } finally {
        setBriefStreaming(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCheckin]);

  // ─── Défilement de la conversation ───
  useEffect(() => {
    if (mode !== "seance") return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: bootScroll.current ? "instant" : "smooth",
    });
    bootScroll.current = false;
  }, [messages, streaming, mode]);

  // ─── Envoi d'un message (bascule en mode séance) ───
  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming || briefStreaming) return;

    setError(null);
    setMode("seance");
    setMessages((prev) => [
      ...prev,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/eden/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, content }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          let evt: {
            type?: string;
            text?: string;
            message?: string;
            conversationId?: string;
            tasks?: Task[];
            createdIds?: string[] | null;
            score?: number | null;
            tier?: Tier | null;
          };
          try {
            evt = JSON.parse(payload);
          } catch {
            continue;
          }

          if (evt.type === "meta" && evt.conversationId) {
            setConvId(evt.conversationId);
          } else if (evt.type === "delta" && evt.text) {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + evt.text,
                };
              }
              return copy;
            });
          } else if (evt.type === "tasks" && evt.tasks) {
            setTasks(evt.tasks);
            if (evt.createdIds && evt.createdIds.length > 0) {
              setWeekOpen(true);
              setNewIds(evt.createdIds);
              setTimeout(() => setNewIds([]), 6000);
            }
          } else if (evt.type === "score" && typeof evt.score === "number") {
            setScore(evt.tier ? { total: evt.score, tier: evt.tier } : null);
          } else if (evt.type === "error") {
            setError(evt.message || "Une erreur est survenue.");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setStreaming(false);
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) copy.pop();
        return copy;
      });
    }
  }

  // ─── Cocher / rouvrir une action ───
  const toggleTask = useCallback(async (task: Task) => {
    const nextStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const updated = await updateTask(supabase, user.id, task.id, {
      status: nextStatus,
    });
    if (!updated) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    // Les points d'élan peuvent faire bouger le score.
    try {
      const res = await fetch("/api/espace/score/recompute", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { score?: number; tier?: Tier };
        if (typeof data.score === "number" && data.tier) {
          setScore({ total: data.score, tier: data.tier });
        }
      }
    } catch {
      // silencieux : le score sera resynchronisé au prochain échange avec Eden
    }
  }, []);

  const handleDocScore = useCallback((total: number, tier: Tier) => {
    setScore({ total, tier });
  }, []);

  const openCount = tasks.filter(isOpen).length;
  const hasHistory = messages.length > 0;

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send(input);
      }}
      className="mx-auto flex w-full max-w-3xl items-center gap-2"
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={briefStreaming ? "Eden écrit…" : "Répondre à Eden…"}
        disabled={streaming || briefStreaming}
        className="flex-1 rounded-full border border-navy/10 bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-foreground/40 focus:border-navy/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={streaming || briefStreaming || !input.trim()}
        aria-label="Envoyer"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy-deep disabled:opacity-40"
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
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );

  // ═══════════════════════ MODE POINT D'ÉTAPE ═══════════════════════
  if (mode === "etape") {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 -left-32 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
          <div className="absolute top-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sun/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative mx-auto flex min-h-full w-full max-w-4xl flex-col px-5 pt-8 sm:px-8"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Point d&rsquo;étape · {dateLabel}
          </p>

          {/* Le mot d'Eden + les signes vitaux, dans un même cadre */}
          <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-navy/8 bg-white/80 shadow-[0_28px_70px_-38px_rgba(35,35,96,0.35)] backdrop-blur-sm">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-leaf via-teal to-sky"
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
              <div className="flex items-start gap-4 p-6 sm:p-8">
                <EdenAvatar size="h-11 w-11" glow />
                <div className="min-w-0 flex-1 pt-1">
                  {brief ? (
                    <Streamdown className={EDEN_PROSE}>{brief}</Streamdown>
                  ) : (
                    <div className="pt-2">
                      <TypingDots />
                    </div>
                  )}
                  {!briefStreaming && brief && (
                    <p className="mt-4 font-eden text-sm italic text-foreground/45">
                      — Eden, votre tuteur
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center border-t border-navy/5 px-8 py-6 lg:w-[240px] lg:border-l lg:border-t-0">
                {hasDiagnostic ? (
                  <ScoreVitals score={score} series={scoreSeries} />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm leading-relaxed text-foreground/60">
                      Votre score apparaîtra après le diagnostic.
                    </p>
                    <Link
                      href="/espace"
                      className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
                    >
                      Faire mon diagnostic · 5 min
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cette semaine + le coffre */}
          <div className="mt-9 grid grid-cols-1 gap-9 lg:grid-cols-[1fr_340px]">
            <section>
              <SectionLabel>Cette semaine</SectionLabel>
              <div className="mt-3">
                <WeekPanel
                  tasks={tasks}
                  newIds={newIds}
                  onToggle={toggleTask}
                  variant="list"
                />
              </div>
            </section>
            <section>
              <SectionLabel>Documents</SectionLabel>
              <div className="mt-3">
                <DocumentsDock
                  initialDocs={initialDocs}
                  onScore={handleDocScore}
                />
              </div>
            </section>
          </div>

          {hasHistory && (
            <button
              type="button"
              onClick={() => setMode("seance")}
              className="mt-8 self-start text-xs font-medium text-foreground/50 underline-offset-4 transition-colors hover:text-navy hover:underline"
            >
              Revoir nos échanges →
            </button>
          )}

          <div className="min-h-8 flex-1" />

          {/* Répondre à Eden — la séance commence ici */}
          <div className="sticky bottom-0 -mx-5 border-t border-navy/5 bg-background/85 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            {composer}
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════ MODE SÉANCE ═══════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative flex h-full"
    >
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Ruban : retour au point d'étape + score + semaine */}
        <div className="flex shrink-0 items-center gap-3 border-b border-navy/5 px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={() => setMode("etape")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Point d&rsquo;étape
          </button>

          <span className="hidden items-center gap-2 text-xs text-foreground/40 sm:inline-flex">
            <Image src={symbole} alt="" className="h-3.5 w-auto" />
            Séance avec Eden
          </span>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {score && (
              <span
                className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${TIER_STYLES[score.tier]}`}
              >
                Score {score.total}
              </span>
            )}
            <button
              type="button"
              onClick={() => setWeekOpen((v) => !v)}
              aria-pressed={weekOpen}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                weekOpen
                  ? "border-navy/15 bg-navy text-white"
                  : "border-navy/15 bg-white text-navy hover:bg-navy/5"
              }`}
            >
              Cette semaine
              {openCount > 0 && (
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.65rem] tabular-nums ${
                    weekOpen ? "bg-white/20" : "bg-navy/10"
                  }`}
                >
                  {openCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Fil de la séance */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-6">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-navy px-4 py-3 text-sm leading-relaxed text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3">
                  <EdenAvatar size="h-8 w-8" />
                  <div className="min-w-0 max-w-[88%] flex-1 pt-0.5">
                    {m.content ? (
                      <Streamdown className={EDEN_PROSE}>
                        {m.content}
                      </Streamdown>
                    ) : (
                      <div className="pt-1.5">
                        <TypingDots />
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {error && (
          <p className="shrink-0 border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="shrink-0 border-t border-navy/5 bg-white/60 p-4">
          {composer}
        </div>
      </div>

      {/* Rail semaine (desktop) */}
      <motion.aside
        initial={false}
        animate={{ width: weekOpen ? 360 : 0 }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="hidden shrink-0 overflow-hidden border-l border-navy/8 bg-white lg:block"
        aria-hidden={!weekOpen}
      >
        <div style={{ width: 360 }} className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-navy/5 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-navy">Cette semaine</h2>
            <button
              type="button"
              onClick={() => setWeekOpen(false)}
              aria-label="Fermer"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-navy/5 hover:text-navy"
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
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <WeekPanel
              tasks={tasks}
              newIds={newIds}
              onToggle={toggleTask}
              variant="list"
            />
          </div>
          <p className="shrink-0 border-t border-navy/5 px-5 py-3 text-xs leading-relaxed text-foreground/45">
            Chaque action complétée fait progresser votre score.
          </p>
        </div>
      </motion.aside>

      {/* Tiroir semaine (mobile) */}
      <AnimatePresence>
        {weekOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fermer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWeekOpen(false)}
              className="absolute inset-0 z-20 bg-navy-deep/30 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-y-0 right-0 z-30 w-[88%] max-w-sm overflow-y-auto border-l border-navy/10 bg-white p-4 shadow-2xl shadow-navy/20 lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy">
                  Cette semaine
                </h2>
                <button
                  type="button"
                  onClick={() => setWeekOpen(false)}
                  aria-label="Fermer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/45 hover:bg-navy/5 hover:text-navy"
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
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <WeekPanel
                tasks={tasks}
                newIds={newIds}
                onToggle={toggleTask}
                variant="list"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
