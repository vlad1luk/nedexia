"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import symbole from "@/public/symbole-eden.png";
import { isOpen, type Task } from "@/lib/espace/tasks";
import type { Tier } from "@/lib/espace/types";
import type { ProgramMilestone } from "@/lib/espace/program";
import { updateTask } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/client";
import { DocumentsDock, type DocItem } from "./documents-dock";
import { ScoreVitals } from "./score-vitals";
import { WeekPanel } from "./week-panel";

/** Livrable rédigé par Eden en cours de séance (via generate_document). */
type GeneratedDoc = { title: string; type: string; markdown: string };
type Message = { role: "user" | "assistant"; content: string; doc?: GeneratedDoc };
type Score = { total: number; tier: Tier } | null;

const TIER_STYLES: Record<Tier, string> = {
  rouge: "bg-coral/10 text-coral",
  orange: "bg-sun/20 text-navy",
  jaune: "bg-sun/15 text-navy",
  vert: "bg-leaf/15 text-leaf-deep",
};

/** Voix d'Eden : serif chaleureuse, prose aérée — rien d'un chatbot. */
const EDEN_PROSE =
  "font-eden text-[1.02rem] leading-[1.72] text-navy-deep/85 [&_strong]:font-semibold [&_strong]:text-navy [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1";

function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-label="Eden écrit">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy/30 [animation-delay:300ms]" />
    </span>
  );
}

/**
 * Révélation douce du texte streamé : le contenu arrive en tampon, l'écran le
 * pose à un rythme régulier avec une micro-respiration aux fins de phrases —
 * la cadence d'un homme qui parle, pas d'un modèle qui débite. Rattrapage
 * adaptatif : plus le tampon est en avance, plus on accélère.
 */
function useSmoothText(target: string, live: boolean): string {
  // Un message historique (monté hors stream) s'affiche entier, sans effet.
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
        // Tampon rattrapé : on ne continue que si le stream vit encore.
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

/** La voix d'Eden : prose rendue en Markdown, posée en douceur si en direct. */
function EdenProse({ text, live }: { text: string; live: boolean }) {
  const shown = useSmoothText(text, live);
  return <Streamdown className={EDEN_PROSE}>{shown}</Streamdown>;
}

/**
 * L'ambiance de la zone de travail : nappes de lumière organiques en dérive
 * très lente, teintées selon l'heure du jour. Calculée après montage pour
 * éviter tout écart d'hydratation.
 */
function Ambience() {
  const [period, setPeriod] = useState<"matin" | "jour" | "soir">("jour");
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const h = new Date().getHours();
      setPeriod(h < 11 ? "matin" : h < 17 ? "jour" : "soir");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const palettes: Record<typeof period, [string, string]> = {
    matin: ["bg-sun/[0.07]", "bg-leaf/[0.07]"],
    jour: ["bg-leaf/[0.07]", "bg-teal/[0.06]"],
    soir: ["bg-teal/[0.07]", "bg-blossom/[0.05]"],
  };
  const [a, b] = palettes[period];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 44, 0], y: [0, 26, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-24 left-1/4 h-96 w-96 rounded-full blur-3xl transition-colors duration-[3000ms] ${a}`}
      />
      <motion.div
        animate={{ x: [0, -36, 0], y: [0, 32, 0] }}
        transition={{ duration: 64, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full blur-3xl transition-colors duration-[3000ms] ${b}`}
      />
    </div>
  );
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
    const blob = new Blob([doc.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_18px_45px_-28px_rgba(35,35,96,0.4)]"
    >
      <div aria-hidden className="h-1 bg-gradient-to-r from-leaf via-teal to-sky" />
      <div className="flex items-center gap-3.5 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
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
          <p className="truncate text-sm font-semibold text-navy">{doc.title}</p>
          <p className="text-xs text-navy/45">
            {DOC_TYPE_LABELS[doc.type] ?? "Document"} · rédigé par Eden
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
          >
            {open ? "Replier" : "Lire"}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-deep"
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
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto border-t border-navy/5 bg-[#faf8f3] px-5 py-4">
              <Streamdown className={EDEN_PROSE}>{doc.markdown}</Streamdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Badge score compact (barre mobile) : pulse au changement + delta envolé. */
function ScoreBadge({ score }: { score: { total: number; tier: Tier } }) {
  const prev = useRef(score.total);
  const [float, setFloat] = useState<{ id: number; delta: number } | null>(null);
  useEffect(() => {
    const d = score.total - prev.current;
    prev.current = score.total;
    if (d !== 0) {
      setFloat({ id: Date.now(), delta: d });
      const t = setTimeout(() => setFloat(null), 1600);
      return () => clearTimeout(t);
    }
  }, [score.total]);

  return (
    <span className="relative inline-flex">
      <motion.span
        key={score.total}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TIER_STYLES[score.tier]}`}
      >
        Score {score.total}
      </motion.span>
      <AnimatePresence>
        {float && (
          <motion.span
            key={float.id}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: -16 }}
            exit={{ opacity: 0, y: -26 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className={`absolute -top-2 right-1 text-xs font-bold tabular-nums ${
              float.delta > 0 ? "text-leaf-deep" : "text-coral"
            }`}
          >
            {float.delta > 0 ? `+${float.delta}` : float.delta}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Le chemin de l'entreprise : jalons du programme, à demeure dans le rail. */
function MilestoneTrail({ milestones }: { milestones: ProgramMilestone[] }) {
  if (milestones.length === 0) return null;
  const done = milestones.filter((m) => m.status === "done").length;

  return (
    <div className="px-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
          Le chemin
        </h2>
        <span className="text-[0.65rem] tabular-nums text-white/35">
          {done}/{milestones.length}
        </span>
      </div>
      <ol className="mt-3 space-y-0.5">
        {milestones.map((m, i) => {
          const isDone = m.status === "done";
          const isCurrent =
            m.status === "in_progress" ||
            (m.status === "todo" &&
              milestones.slice(0, i).every((x) => x.status === "done"));
          return (
            <li key={m.id} className="relative flex gap-3 pb-3 last:pb-0">
              {/* Fil vertical entre jalons */}
              {i < milestones.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-[7px] top-5 h-[calc(100%-14px)] w-px ${
                    isDone ? "bg-leaf/50" : "bg-white/10"
                  }`}
                />
              )}
              <span
                className={`relative mt-0.5 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border ${
                  isDone
                    ? "border-leaf bg-leaf"
                    : isCurrent
                      ? "border-sun bg-transparent"
                      : "border-white/20 bg-transparent"
                }`}
              >
                {isDone && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#232360"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-2 w-2"
                  >
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                )}
                {isCurrent && (
                  <motion.span
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-1.5 w-1.5 rounded-full bg-sun"
                  />
                )}
              </span>
              <span
                className={`min-w-0 text-[0.78rem] leading-snug ${
                  isDone
                    ? "text-white/35"
                    : isCurrent
                      ? "font-medium text-white"
                      : "text-white/50"
                }`}
              >
                {m.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function Workspace({
  displayName,
  companyName,
  email,
  dateLabel,
  score: initialScore,
  scoreSeries,
  hasDiagnostic,
  initialTasks,
  initialDocs,
  initialMilestones = [],
  initialConversationId,
  initialMessages,
  needsCheckin,
}: {
  displayName: string;
  companyName: string | null;
  email: string;
  dateLabel: string;
  score: Score;
  scoreSeries: number[];
  hasDiagnostic: boolean;
  initialTasks: Task[];
  initialDocs: DocItem[];
  initialMilestones: ProgramMilestone[];
  initialConversationId: string | null;
  initialMessages: Message[];
  needsCheckin: boolean;
}) {
  const [convId, setConvId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [milestones, setMilestones] = useState<ProgramMilestone[]>(initialMilestones);
  const [score, setScore] = useState<Score>(initialScore);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Le point d'étape en cours de génération (avant d'entrer dans le fil).
  const [checkinText, setCheckinText] = useState("");
  const [checkinStreaming, setCheckinStreaming] = useState(needsCheckin);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkinRan = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootScroll = useRef(true);

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
          setCheckinStreaming(false);
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
            let evt: { type?: string; text?: string; conversationId?: string };
            try {
              evt = JSON.parse(payload);
            } catch {
              continue;
            }
            if (evt.type === "meta" && evt.conversationId) {
              setConvId(evt.conversationId);
            } else if (evt.type === "delta" && evt.text) {
              text += evt.text;
              setCheckinText(text);
            }
          }
        }
        if (text.trim()) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: text.trim() },
          ]);
        }
      } catch {
        // silencieux : l'espace reste utilisable, Eden répondra au premier message
      } finally {
        setCheckinText("");
        setCheckinStreaming(false);
      }
    })();
  }, [needsCheckin]);

  // ─── Défilement du fil ───
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: bootScroll.current ? "instant" : "smooth",
    });
    bootScroll.current = false;
  }, [messages, checkinText, streaming]);

  // ─── Envoi d'un message ───
  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming || checkinStreaming) return;

    setError(null);
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
            label?: string;
            message?: string;
            conversationId?: string;
            tasks?: Task[];
            createdIds?: string[] | null;
            score?: number | null;
            tier?: Tier | null;
            generated?: GeneratedDoc;
            saved?: { id?: string; name?: string; size?: number | null } | null;
            document?: {
              id: string;
              name: string;
              analysisStatus?: string;
              analysis?: { docType?: string } | null;
            };
            milestone?: ProgramMilestone;
          };
          try {
            evt = JSON.parse(payload);
          } catch {
            continue;
          }

          if (evt.type === "meta" && evt.conversationId) {
            setConvId(evt.conversationId);
          } else if (evt.type === "status" && evt.label) {
            setStatus(evt.label);
          } else if (evt.type === "delta" && evt.text) {
            setStatus(null);
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
              setNewIds(evt.createdIds);
              setTimeout(() => setNewIds([]), 6000);
            }
          } else if (evt.type === "score" && typeof evt.score === "number") {
            setScore(evt.tier ? { total: evt.score, tier: evt.tier } : null);
          } else if (evt.type === "milestone" && evt.milestone) {
            const m = evt.milestone;
            setMilestones((prev) =>
              prev.map((x) => (x.id === m.id ? { ...x, ...m } : x))
            );
          } else if (evt.type === "document" && evt.generated) {
            // Eden vient de rédiger un livrable : carte inline dans le fil.
            const card: Message = {
              role: "assistant",
              content: "",
              doc: evt.generated,
            };
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              // La carte se glisse avant la réponse en cours de frappe.
              if (last?.role === "assistant" && !last.content.trim() && !last.doc) {
                copy.splice(copy.length - 1, 0, card);
              } else {
                copy.push(card);
              }
              return copy;
            });
            const saved = evt.saved;
            if (saved?.id && saved.name) {
              const savedDoc: DocItem = {
                id: saved.id,
                name: saved.name,
                size: saved.size ?? null,
                analysisStatus: "unsupported",
                docType: null,
              };
              setDocs((prev) => [savedDoc, ...prev]);
            }
          } else if (evt.type === "document" && evt.document) {
            // Analyse terminée pendant la séance : le coffre se met à jour.
            const d = evt.document;
            setDocs((prev) =>
              prev.map((x) =>
                x.id === d.id
                  ? {
                      ...x,
                      analysisStatus: d.analysisStatus ?? "done",
                      docType: d.analysis?.docType ?? x.docType,
                    }
                  : x
              )
            );
          } else if (evt.type === "error") {
            setError(evt.message || "Une erreur est survenue.");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setStreaming(false);
      setStatus(null);
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content.trim() && !last.doc)
          copy.pop();
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
  const showEmptyInvite =
    !hasDiagnostic && messages.length === 0 && !checkinStreaming;

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send(input);
      }}
      className="mx-auto flex w-full max-w-[720px] items-center gap-2.5"
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={checkinStreaming ? "Eden écrit…" : "Répondre à Eden…"}
        disabled={streaming || checkinStreaming}
        className="flex-1 rounded-2xl border border-navy/10 bg-white px-5 py-3.5 text-[0.95rem] text-navy shadow-[0_10px_30px_-18px_rgba(35,35,96,0.35)] outline-none transition-colors placeholder:text-navy/35 focus:border-navy/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={streaming || checkinStreaming || !input.trim()}
        aria-label="Envoyer"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-[0_10px_25px_-12px_rgba(35,35,96,0.6)] transition-all hover:-translate-y-px hover:bg-navy-deep disabled:opacity-40 disabled:shadow-none"
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
  );

  const sidePanel = (
    <div className="flex flex-col gap-7">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-navy/40">
            Cette semaine
          </h2>
          {openCount > 0 && (
            <span className="text-[0.65rem] tabular-nums text-navy/35">
              {openCount} en cours
            </span>
          )}
        </div>
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
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Documents
        </h2>
        <div className="mt-3">
          <DocumentsDock docs={docs} setDocs={setDocs} onScore={handleDocScore} />
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex h-full bg-[#faf8f3]">
      {/* ═══════════ LE RAIL — l'enveloppe sombre du cabinet ═══════════ */}
      <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-navy-deep via-navy-deep to-navy text-white lg:flex">
        {/* Identité */}
        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-[0_0_25px_-4px_rgba(153,202,60,0.45)]">
            <Image src={symbole} alt="" className="h-auto w-full" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase leading-tight tracking-[0.2em] text-white/40">
              Nedexia · Eden
            </p>
            <p className="truncate text-[0.95rem] font-semibold leading-tight">
              {companyName ?? displayName}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="border-t border-white/8 px-5 py-6">
          {hasDiagnostic ? (
            <ScoreVitals score={score} series={scoreSeries} />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-white/60">
                Votre score apparaîtra après le diagnostic.
              </p>
              <Link
                href="/espace"
                className="inline-flex items-center justify-center rounded-full bg-leaf px-4 py-2.5 text-sm font-semibold text-navy-deep transition-colors hover:bg-leaf/90"
              >
                Faire mon diagnostic
              </Link>
            </div>
          )}
        </div>

        {/* Jalons */}
        {milestones.length > 0 && (
          <div className="border-t border-white/8 py-6">
            <MilestoneTrail milestones={milestones} />
          </div>
        )}

        <div className="flex-1" />

        {/* Compte */}
        <div className="border-t border-white/8 px-5 py-4">
          <p className="truncate text-xs text-white/40">{email}</p>
          <div className="mt-2 flex items-center gap-4 text-xs font-medium">
            <Link href="/" className="text-white/60 transition-colors hover:text-white">
              Retour au site
            </Link>
            <a
              href="/auth/signout?next=/connexion"
              className="text-white/60 transition-colors hover:text-white"
            >
              Se déconnecter
            </a>
          </div>
        </div>
      </aside>

      {/* ═══════════ LA ZONE DE TRAVAIL — crème chaud ═══════════ */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <Ambience />

        {/* En-tête fin */}
        <div className="relative flex shrink-0 items-center gap-3 border-b border-navy/8 px-5 py-3 sm:px-8">
          {/* Identité compacte (le rail est masqué sous lg) */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white p-1 lg:hidden">
            <Image src={symbole} alt="" className="h-auto w-full" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-navy/40">
              Point d&rsquo;étape
            </p>
            <p className="truncate text-sm font-semibold text-navy">{dateLabel}</p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {score && (
              <span className="lg:hidden">
                <ScoreBadge score={score} />
              </span>
            )}
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5 xl:hidden"
            >
              Cette semaine
              {openCount > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-navy/10 px-1 text-[0.65rem] tabular-nums">
                  {openCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Le fil — une seule conversation continue */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px] space-y-6 px-5 py-8 sm:px-8">
            {showEmptyInvite && (
              <div className="rounded-3xl border border-navy/10 bg-white px-6 py-10 text-center shadow-[0_24px_60px_-40px_rgba(35,35,96,0.4)]">
                <p className="font-eden text-lg text-navy">
                  Bienvenue, {displayName}.
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy/55">
                  Faites d&rsquo;abord votre diagnostic : Eden construira votre
                  dossier, votre score et votre chemin.
                </p>
                <Link
                  href="/espace"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
                >
                  Faire mon diagnostic · 5 min
                </Link>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy px-4.5 py-3 text-[0.95rem] leading-relaxed text-white shadow-[0_12px_30px_-18px_rgba(35,35,96,0.55)]">
                    {m.content}
                  </div>
                </div>
              ) : m.doc ? (
                <div key={i}>
                  <DeliverableCard doc={m.doc} />
                </div>
              ) : (
                <div key={i} className="group">
                  {m.content ? (
                    <>
                      <EdenProse
                        text={m.content}
                        live={streaming && i === messages.length - 1}
                      />
                      {!(streaming && i === messages.length - 1) && (
                        <div className="mt-3 flex items-center gap-2" aria-hidden>
                          <span className="h-px w-8 bg-navy/15" />
                          <span className="font-eden text-xs italic text-navy/35">
                            Eden
                          </span>
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
                            className="font-eden text-sm italic text-navy/50"
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

            {/* Point d'étape en cours de génération */}
            {checkinStreaming && (
              <div>
                {checkinText ? (
                  <EdenProse text={checkinText} live />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <TypingDots />
                    <span className="font-eden text-sm italic text-navy/45">
                      Eden prépare votre point d&rsquo;étape…
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="relative shrink-0 border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Composer */}
        <div className="relative shrink-0 px-5 pb-5 pt-2 sm:px-8">{composer}</div>
      </div>

      {/* ═══════════ LA COLONNE D'ÉTAT — actions & documents ═══════════ */}
      <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-navy/8 bg-white/60 px-5 py-6 backdrop-blur-sm xl:block">
        {sidePanel}
      </aside>

      {/* Tiroir (sous xl) */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fermer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="absolute inset-0 z-20 bg-navy-deep/30 backdrop-blur-[2px] xl:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-y-0 right-0 z-30 w-[88%] max-w-sm overflow-y-auto border-l border-navy/10 bg-[#faf8f3] p-5 shadow-2xl shadow-navy/20 xl:hidden"
            >
              <div className="mb-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Fermer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-navy/45 hover:bg-navy/5 hover:text-navy"
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
              {sidePanel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
