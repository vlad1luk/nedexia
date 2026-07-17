"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEspace } from "./espace-context";

/**
 * Palette de commandes (⌘K) — sauter à une page ou lancer une action, à la
 * Linear. Registre carnet : liste à filets, sélection marquée d'une barre
 * rouille, navigation complète au clavier (↑ ↓ Entrée Échap).
 */

type Command = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const { paletteOpen } = useEspace();
  // Montée seulement à l'ouverture : l'état (requête, sélection) repart
  // frais à chaque invocation, sans effet de synchronisation.
  if (!paletteOpen) return null;
  return <PaletteDialog />;
}

function PaletteDialog() {
  const router = useRouter();
  const { setPaletteOpen, toggleEden, hasDiagnostic } = useEspace();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      setPaletteOpen(false);
      router.push(href);
    };
    const items: Command[] = [
      { id: "accueil", label: "Accueil", hint: "Vue d'ensemble", run: go("/espace/entreprise") },
      { id: "preparation", label: "Préparation", hint: "Score détaillé", keywords: "score", run: go("/espace/entreprise/preparation") },
      { id: "programme", label: "Programme", hint: "Jalons et actions", keywords: "taches jalons", run: go("/espace/entreprise/programme") },
      { id: "financement", label: "Financement", hint: "Dossier et programmes", keywords: "subventions argent", run: go("/espace/entreprise/financement") },
      { id: "documents", label: "Documents", hint: "Bibliothèque", run: go("/espace/entreprise/documents") },
      { id: "matching", label: "Matching", hint: "Accès et compatibilités", run: go("/espace/entreprise/matching") },
      { id: "parametres", label: "Paramètres", hint: "Compte, crédits, intégrations", keywords: "compte reglages settings", run: go("/espace/entreprise/parametres") },
      {
        id: "eden",
        label: "Parler à Eden",
        hint: "⌘E",
        keywords: "conseiller chat",
        run: () => {
          setPaletteOpen(false);
          toggleEden();
        },
      },
    ];
    if (!hasDiagnostic) {
      items.push({
        id: "diagnostic",
        label: "Faire mon diagnostic",
        hint: "7 min, sans document",
        run: () => {
          setPaletteOpen(false);
          router.push("/espace");
        },
      });
    }
    items.push({
      id: "site",
      label: "Retour au site",
      run: () => {
        setPaletteOpen(false);
        router.push("/");
      },
    });
    return items;
  }, [router, setPaletteOpen, toggleEden, hasDiagnostic]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // La sélection reste visible en défilant.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/30 px-4 pt-[14vh]"
      onClick={() => setPaletteOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
        className="w-full max-w-lg border border-ink/20 bg-parchment shadow-[0_28px_70px_-30px_rgba(27,36,48,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink/15 px-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4 shrink-0 text-ink-soft"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                filtered[index]?.run();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setPaletteOpen(false);
              }
            }}
            placeholder="Aller à une page, lancer une action…"
            className="w-full bg-transparent py-3.5 text-[0.95rem] text-ink outline-none placeholder:text-ink-soft/60"
          />
          <kbd className="shrink-0 border border-ink/15 px-1.5 py-0.5 font-mono text-[0.62rem] text-ink-soft">
            esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-72 overflow-y-auto py-1.5" role="listbox">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-ink-soft">
              Aucun résultat pour « {query} »
            </li>
          )}
          {filtered.map((cmd, i) => (
            <li key={cmd.id} data-index={i}>
              <button
                type="button"
                role="option"
                aria-selected={i === index}
                onMouseEnter={() => setIndex(i)}
                onClick={() => cmd.run()}
                className={`relative flex w-full items-baseline justify-between gap-4 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === index ? "bg-ink/5 text-ink" : "text-ink-soft"
                }`}
              >
                {i === index && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-rust"
                  />
                )}
                <span className="font-medium">{cmd.label}</span>
                {cmd.hint && (
                  <span className="shrink-0 text-xs text-ink-soft/70">{cmd.hint}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 border-t border-ink/15 px-4 py-2 text-[0.65rem] text-ink-soft/70">
          <span>
            <kbd className="border border-ink/15 px-1 font-mono">↑↓</kbd> naviguer
          </span>
          <span>
            <kbd className="border border-ink/15 px-1 font-mono">↵</kbd> ouvrir
          </span>
        </div>
      </div>
    </div>
  );
}
