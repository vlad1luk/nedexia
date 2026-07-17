"use client";

import { useMemo, useState } from "react";
import { useEspace } from "./../espace-context";
import { DocumentsDock } from "./../documents-dock";
import { PageHeader, Panel } from "./../ui";

/**
 * Documents — la bibliothèque complète du dossier : dépôt, recherche,
 * filtres (déposés par l'entreprise vs rédigés par Eden). Le dépôt reste la
 * seule affordance en pointillé de la page (règle : pointillé = action).
 */

type Filter = "tous" | "deposes" | "eden";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "deposes", label: "Déposés" },
  { id: "eden", label: "Rédigés par Eden" },
];

/** Heuristique existante : les livrables d'Eden sont stockés en Markdown. */
function isEdenAuthored(name: string) {
  return name.endsWith(".md");
}

export default function DocumentsPage() {
  const { docs, setDocs, handleDocScore } = useEspace();
  const [filter, setFilter] = useState<Filter>("tous");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (filter === "deposes" && isEdenAuthored(d.name)) return false;
      if (filter === "eden" && !isEdenAuthored(d.name)) return false;
      if (q && !d.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [docs, filter, query]);

  return (
    <>
      <PageHeader
        title="Documents"
        lede="Tout le dossier au même endroit — ce que vous déposez, ce qu'Eden rédige et analyse."
        meta={
          docs.length > 0 ? (
            <span className="font-mono text-sm tabular-nums text-ink-soft">
              {docs.length} document{docs.length > 1 ? "s" : ""}
            </span>
          ) : null
        }
      />

      <Panel label="Bibliothèque">
        {/* Recherche + filtres */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 border border-ink/20 bg-parchment px-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-3.5 w-3.5 shrink-0 text-ink-soft"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un document…"
              aria-label="Rechercher un document"
              className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60"
            />
          </div>
          <div className="flex shrink-0" role="group" aria-label="Filtrer les documents">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`border border-l-0 border-ink/20 px-3 py-2 text-xs font-semibold transition-colors first:border-l focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rust ${
                  filter === f.id
                    ? "bg-ink text-parchment"
                    : "bg-parchment text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dépôt + liste (composant partagé, liste filtrée) */}
        <div className="mt-4">
          <DocumentsDock
            docs={filtered}
            setDocs={setDocs}
            onScore={handleDocScore}
            limit={60}
          />
        </div>

        {filtered.length === 0 && docs.length > 0 && (
          <p className="mt-4 text-center text-sm text-ink-soft">
            Aucun document ne correspond
            {query ? ` à « ${query} »` : " à ce filtre"}.
          </p>
        )}
      </Panel>
    </>
  );
}
