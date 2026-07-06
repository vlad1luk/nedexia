"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

const STARTERS = [
  "Je veux vendre mon entreprise d’ici 2 ans.",
  "Mes ventes stagnent, par où commencer ?",
  "Je cherche un partenaire pour distribuer mon produit.",
];

export default function EdenTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    setError(null);
    const nextHistory: Message[] = [...messages, { role: "user", content }];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/eden/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
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

          let evt: { type?: string; text?: string; message?: string; detail?: string };
          try {
            evt = JSON.parse(payload);
          } catch {
            continue;
          }

          if (evt.type === "delta" && evt.text) {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { ...last, content: last.content + evt.text };
              }
              return copy;
            });
          } else if (evt.type === "error") {
            setError(
              [evt.message, evt.detail].filter(Boolean).join(" — ") ||
                "Une erreur est survenue."
            );
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1]?.role === "assistant" && !copy[copy.length - 1].content) {
          copy.pop();
        }
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col px-4 py-8">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
          E
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold tracking-tight text-navy">Eden — chat de test</h1>
          <p className="truncate text-xs text-foreground/50">
            {userEmail ? (
              <>Connecté : <span className="font-medium text-navy">{userEmail}</span></>
            ) : (
              <>Route <code className="rounded bg-navy/5 px-1">/api/eden/demo</code></>
            )}
          </p>
        </div>
        <a
          href="/auth/signout?next=/connexion"
          className="shrink-0 rounded-full border border-navy/15 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-navy/5"
        >
          Déconnexion
        </a>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-xs text-sm text-foreground/50">
                Envoyez un message pour vérifier qu’Eden répond correctement.
              </p>
              <div className="flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-navy/10 px-4 py-2 text-sm text-navy transition-colors hover:border-navy/30 hover:bg-navy/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-navy text-white"
                    : "rounded-tl-sm bg-navy/5 text-foreground/85"
                }`}
              >
                {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-navy/10 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire à Eden…"
            disabled={streaming}
            className="flex-1 rounded-full border border-navy/10 bg-background px-4 py-2.5 text-sm text-navy outline-none placeholder:text-foreground/40 focus:border-navy/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-opacity disabled:opacity-40"
            aria-label="Envoyer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
