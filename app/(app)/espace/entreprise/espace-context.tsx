"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { ProgramMilestone } from "@/lib/espace/program";
import type { ScoreHistoryPoint } from "@/lib/espace/score-history";
import { isOpen, type Task } from "@/lib/espace/tasks";
import type { DimensionId, Tier } from "@/lib/espace/types";
import { updateTask } from "@/lib/espace/task-store";
import { createClient } from "@/lib/supabase/client";
import type { DocItem } from "./documents-dock";

/**
 * L'état partagé de l'espace — la source de vérité unique.
 *
 * Le layout serveur charge tout une seule fois ; ce provider tient l'état
 * vivant pour toutes les pages et les deux panneaux persistants (sidebar,
 * Eden). Le score affiché dans la sidebar et celui de la page Préparation
 * sont le même objet ; une action posée ici (cocher une tâche, répondre à
 * Eden) met à jour badges et compteurs partout, sans rechargement.
 */

/** Livrable rédigé par Eden en cours de séance (via generate_document). */
export type GeneratedDoc = { title: string; type: string; markdown: string };
export type Message = {
  role: "user" | "assistant";
  content: string;
  doc?: GeneratedDoc;
};
export type Score = { total: number; tier: Tier } | null;

/**
 * Résumé du dossier de financement affiché dans l'espace.
 *
 * POINT D'INTÉGRATION : aucun suivi de financement n'est encore persisté
 * côté espace (le diagnostic /financement produit un verdict non stocké).
 * Tant que la source n'est pas branchée, la valeur reste `null` et la page
 * Financement affiche son état d'invitation — ne pas inventer de chiffres.
 */
export type FinancementSummary = {
  programCount: number;
  estimatedAmount: number;
  fundablePortion: number | null;
  nextStep: string;
  status: "a_preparer" | "en_cours" | "depose";
};

/** Libellés de contexte envoyés à Eden selon la page active. */
const PAGE_CONTEXT: Record<string, string> = {
  "/espace/entreprise": "Accueil (vue d'ensemble)",
  "/espace/entreprise/preparation": "Préparation (score détaillé)",
  "/espace/entreprise/programme": "Programme (jalons et actions)",
  "/espace/entreprise/financement": "Financement (dossier et programmes)",
  "/espace/entreprise/documents": "Documents (bibliothèque)",
  "/espace/entreprise/matching": "Matching (accès et compatibilités)",
  "/espace/entreprise/parametres": "Paramètres",
};

type EspaceContextValue = {
  // Identité
  displayName: string;
  companyName: string | null;
  email: string;
  dateLabel: string;
  hasDiagnostic: boolean;

  // Données vivantes
  score: Score;
  scoreDimensions: Record<DimensionId, number | null> | null;
  scoreHistory: ScoreHistoryPoint[];
  tasks: Task[];
  newTaskIds: string[];
  openTaskCount: number;
  docs: DocItem[];
  setDocs: Dispatch<SetStateAction<DocItem[]>>;
  milestones: ProgramMilestone[];
  financement: FinancementSummary | null;

  // Conversation Eden
  messages: Message[];
  streaming: boolean;
  checkinStreaming: boolean;
  checkinText: string;
  status: string | null;
  error: string | null;
  send: (text: string) => void;

  // Panneaux
  edenDesktopOpen: boolean;
  edenMobileOpen: boolean;
  toggleEden: () => void;
  openEdenMobile: () => void;
  closeEden: () => void;
  edenUnread: number;
  paletteOpen: boolean;
  setPaletteOpen: Dispatch<SetStateAction<boolean>>;

  // Actions
  toggleTask: (task: Task) => void;
  handleDocScore: (total: number, tier: Tier) => void;
};

const EspaceContext = createContext<EspaceContextValue | null>(null);

export function useEspace(): EspaceContextValue {
  const ctx = useContext(EspaceContext);
  if (!ctx) throw new Error("useEspace hors du EspaceProvider");
  return ctx;
}

export function EspaceProvider({
  displayName,
  companyName,
  email,
  dateLabel,
  hasDiagnostic,
  initialScore,
  scoreDimensions,
  initialScoreHistory,
  initialTasks,
  initialDocs,
  initialMilestones,
  initialConversationId,
  initialMessages,
  needsCheckin,
  children,
}: {
  displayName: string;
  companyName: string | null;
  email: string;
  dateLabel: string;
  hasDiagnostic: boolean;
  initialScore: Score;
  scoreDimensions: Record<DimensionId, number | null> | null;
  initialScoreHistory: ScoreHistoryPoint[];
  initialTasks: Task[];
  initialDocs: DocItem[];
  initialMilestones: ProgramMilestone[];
  initialConversationId: string | null;
  initialMessages: Message[];
  needsCheckin: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [convId, setConvId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [milestones, setMilestones] = useState<ProgramMilestone[]>(initialMilestones);
  const [score, setScore] = useState<Score>(initialScore);
  const [scoreHistory, setScoreHistory] =
    useState<ScoreHistoryPoint[]>(initialScoreHistory);
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);

  // POINT D'INTÉGRATION : suivi de financement non branché (voir type).
  const financement: FinancementSummary | null = null;

  // Panneau Eden : état desktop (colonne rétractable) et mobile (tiroir).
  const [edenDesktopOpen, setEdenDesktopOpen] = useState(true);
  const [edenMobileOpen, setEdenMobileOpen] = useState(false);
  const [edenUnread, setEdenUnread] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [checkinText, setCheckinText] = useState("");
  const [checkinStreaming, setCheckinStreaming] = useState(needsCheckin);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkinRan = useRef(false);

  // Visibilité réelle du panneau (pour le compteur non-lu).
  const isDesktopRef = useRef(true);
  const panelVisibleRef = useRef(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => {
      isDesktopRef.current = mq.matches;
      panelVisibleRef.current = mq.matches ? edenDesktopOpen : edenMobileOpen;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [edenDesktopOpen, edenMobileOpen]);

  const noteAssistantActivity = useCallback(() => {
    if (!panelVisibleRef.current) setEdenUnread((n) => n + 1);
  }, []);

  const toggleEden = useCallback(() => {
    if (isDesktopRef.current) {
      setEdenDesktopOpen((v) => {
        if (!v) setEdenUnread(0);
        return !v;
      });
    } else {
      setEdenMobileOpen((v) => {
        if (!v) setEdenUnread(0);
        return !v;
      });
    }
  }, []);

  const openEdenMobile = useCallback(() => {
    setEdenMobileOpen(true);
    setEdenUnread(0);
  }, []);

  const closeEden = useCallback(() => {
    if (isDesktopRef.current) setEdenDesktopOpen(false);
    else setEdenMobileOpen(false);
  }, []);

  // ─── Raccourcis clavier globaux : ⌘K palette, ⌘E Eden ───
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        toggleEden();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleEden]);

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
          setMessages((prev) => [...prev, { role: "assistant", content: text.trim() }]);
          noteAssistantActivity();
        }
      } catch {
        // silencieux : l'espace reste utilisable, Eden répondra au premier message
      } finally {
        setCheckinText("");
        setCheckinStreaming(false);
      }
    })();
  }, [needsCheckin, noteAssistantActivity]);

  // ─── Envoi d'un message à Eden ───
  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming || checkinStreaming) return;

      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content },
        { role: "assistant", content: "" },
      ]);
      setStreaming(true);

      try {
        const res = await fetch("/api/eden/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: convId,
            content,
            pageContext: PAGE_CONTEXT[pathname] ?? null,
          }),
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
                setNewTaskIds(evt.createdIds);
                setTimeout(() => setNewTaskIds([]), 30000);
              }
            } else if (evt.type === "score" && typeof evt.score === "number") {
              const tier = evt.tier ?? null;
              setScore(tier ? { total: evt.score, tier } : null);
              if (tier) {
                const total = evt.score;
                setScoreHistory((prev) =>
                  prev.length === 0 || prev[prev.length - 1].total !== total
                    ? [...prev, { total, tier, createdAt: new Date().toISOString() }]
                    : prev
                );
              }
            } else if (evt.type === "milestone" && evt.milestone) {
              const m = evt.milestone;
              setMilestones((prev) =>
                prev.map((x) => (x.id === m.id ? { ...x, ...m } : x))
              );
            } else if (evt.type === "document" && evt.generated) {
              const card: Message = {
                role: "assistant",
                content: "",
                doc: evt.generated,
              };
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
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
        noteAssistantActivity();
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
    },
    [convId, pathname, streaming, checkinStreaming, noteAssistantActivity]
  );

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
          const total = data.score;
          const tier = data.tier;
          setScore({ total, tier });
          setScoreHistory((prev) =>
            prev.length === 0 || prev[prev.length - 1].total !== total
              ? [...prev, { total, tier, createdAt: new Date().toISOString() }]
              : prev
          );
        }
      }
    } catch {
      // silencieux : le score sera resynchronisé au prochain échange avec Eden
    }
  }, []);

  const handleDocScore = useCallback((total: number, tier: Tier) => {
    setScore({ total, tier });
    setScoreHistory((prev) =>
      prev.length === 0 || prev[prev.length - 1].total !== total
        ? [...prev, { total, tier, createdAt: new Date().toISOString() }]
        : prev
    );
  }, []);

  const openTaskCount = useMemo(() => tasks.filter(isOpen).length, [tasks]);

  const value: EspaceContextValue = {
    displayName,
    companyName,
    email,
    dateLabel,
    hasDiagnostic,
    score,
    scoreDimensions,
    scoreHistory,
    tasks,
    newTaskIds,
    openTaskCount,
    docs,
    setDocs,
    milestones,
    financement,
    messages,
    streaming,
    checkinStreaming,
    checkinText,
    status,
    error,
    send,
    edenDesktopOpen,
    edenMobileOpen,
    toggleEden,
    openEdenMobile,
    closeEden,
    edenUnread,
    paletteOpen,
    setPaletteOpen,
    toggleTask,
    handleDocScore,
  };

  return <EspaceContext.Provider value={value}>{children}</EspaceContext.Provider>;
}
