"use client";

import type { ScoreHistoryPoint } from "@/lib/espace/score-history";
import {
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
  TIER_LABELS,
  type DimensionId,
} from "@/lib/espace/types";
import { useEspace } from "./../espace-context";
import { MATCHING_THRESHOLD, PageHeader, Panel } from "./../ui";

/**
 * Préparation — le score en détail. L'historique complet (pas juste deux
 * points), les cinq dimensions avec leur explication et leur poids, et ce
 * qui fait monter ou descendre le chiffre. Même source de vérité que la
 * sidebar : l'état du provider.
 */

/** Explications des dimensions — mêmes définitions que la page publique /score. */
const DIMENSION_NOTES: Record<DimensionId, string> = {
  finances:
    "Marges, liquidités, états à jour — la capacité de tenir, d'investir et de se financer.",
  independance:
    "Ce qui se passe si vous partez trois semaines. Une entreprise prête tient debout sans son fondateur.",
  structure:
    "Conventions, registres, rôles clairs — ce qui rend l'entreprise lisible pour un tiers.",
  clarte:
    "Votre offre, votre message, vos priorités — compréhensibles en dix minutes par quelqu'un d'externe.",
  reputation:
    "Références, présence, traces publiques — ce que le marché dit de vous quand vous n'êtes pas là.",
};

const ORDER: DimensionId[] = (
  Object.keys(DIMENSION_WEIGHTS) as DimensionId[]
).sort((a, b) => DIMENSION_WEIGHTS[b] - DIMENSION_WEIGHTS[a]);

const LEVIERS = [
  {
    titre: "Le travail complété",
    texte:
      "Chaque action terminée avec Eden ajoute des points d'élan — jusqu'à +8. C'est le levier le plus direct.",
  },
  {
    titre: "Les documents analysés",
    texte:
      "Un état financier ou un plan déposé enrichit le dossier : Eden en tire des réponses que le diagnostic n'avait pas.",
  },
  {
    titre: "Les dimensions à documenter",
    texte:
      "Une dimension sans réponse n'est pas pénalisée — elle est exclue du calcul. La documenter précise le score, dans un sens ou l'autre.",
  },
] as const;

const dateFmt = new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "short" });

export default function PreparationPage() {
  const { score, scoreDimensions, scoreHistory, hasDiagnostic } = useEspace();

  if (!hasDiagnostic || !score) {
    return (
      <>
        <PageHeader
          title="Préparation"
          lede="Votre score apparaîtra ici après le diagnostic."
        />
      </>
    );
  }

  const delta =
    scoreHistory.length >= 2
      ? scoreHistory[scoreHistory.length - 1].total - scoreHistory[0].total
      : 0;

  return (
    <>
      <PageHeader
        title="Préparation"
        lede="Un chiffre honnête, cinq dimensions pondérées, un chemin pour progresser."
      />

      <div className="flex flex-col gap-4">
        {/* Le chiffre + trajectoire complète */}
        <Panel
          label="Score de préparation"
          meta={
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {TIER_LABELS[score.tier]}
            </span>
          }
        >
          <div className="flex items-baseline gap-3">
            <span className="font-eden text-6xl font-medium leading-none text-ink tabular-nums sm:text-7xl">
              {score.total}
            </span>
            <span className="font-eden text-xl italic text-ink-soft">/100</span>
            <span className="ml-auto flex flex-col items-end gap-0.5">
              {delta !== 0 && (
                <span className="text-sm text-ink-soft">
                  <span
                    className={`font-mono tabular-nums ${delta > 0 ? "text-moss" : "text-rust"}`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>{" "}
                  depuis le départ
                </span>
              )}
              <span className="font-eden text-xs italic text-ink-soft">
                score indicatif — il se précise avec le travail
              </span>
            </span>
          </div>

          {scoreHistory.length >= 2 && (
            <div className="mt-6 border-t border-ink/15 pt-5">
              <HistoryChart history={scoreHistory} />
            </div>
          )}
        </Panel>

        {/* Les cinq dimensions */}
        <Panel label="Les cinq dimensions">
          <div className="flex flex-col border-t border-ink/15">
            {ORDER.map((dim, i) => {
              const value = scoreDimensions?.[dim] ?? null;
              return (
                <article
                  key={dim}
                  className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-b border-ink/15 py-5 sm:grid-cols-[2.5rem_1fr_10rem]"
                >
                  <span className="font-eden text-base italic text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="flex items-baseline gap-2 text-base font-semibold text-ink">
                      {DIMENSION_LABELS[dim]}
                      <span className="font-eden text-sm font-normal italic text-rust">
                        ×{DIMENSION_WEIGHTS[dim]}
                      </span>
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {DIMENSION_NOTES[dim]}
                    </p>
                  </div>
                  <div className="col-start-2 flex items-center gap-3 sm:col-start-3 sm:pt-1">
                    <div className="h-[3px] flex-1 bg-ink/10">
                      {value != null && (
                        <div
                          className="h-full bg-moss/70"
                          style={{ width: `${value}%` }}
                        />
                      )}
                    </div>
                    <span className="w-16 shrink-0 text-right">
                      {value != null ? (
                        <span className="font-mono text-sm tabular-nums text-ink">
                          {value}
                        </span>
                      ) : (
                        <span className="font-eden text-xs italic text-ink-soft">
                          à documenter
                        </span>
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Les finances et l&rsquo;indépendance comptent double — c&rsquo;est
            là que les financements, alliances et transmissions se gagnent ou
            se perdent.
          </p>
        </Panel>

        {/* Ce qui fait bouger le score */}
        <Panel label="Ce qui fait bouger le score">
          <div className="flex flex-col border-t border-ink/15">
            {LEVIERS.map((l, i) => (
              <article
                key={l.titre}
                className="flex flex-col gap-1.5 border-b border-ink/15 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="shrink-0 font-eden text-base italic text-brass sm:w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="shrink-0 text-sm font-semibold text-ink sm:w-56">
                  {l.titre}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{l.texte}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/**
 * Trajectoire complète du score — échelle fixe 0-100, seuil 70 marqué
 * (l'accès au matching), points datés. Trait d'encre, pas de dégradé.
 */
function HistoryChart({ history }: { history: ScoreHistoryPoint[] }) {
  const w = 640;
  const h = 180;
  const padX = 8;
  const padY = 14;

  const x = (i: number) =>
    padX + (i * (w - padX * 2)) / Math.max(1, history.length - 1);
  const y = (v: number) => padY + ((100 - v) * (h - padY * 2)) / 100;

  const d = history
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.total).toFixed(1)}`)
    .join(" ");
  const last = history[history.length - 1];
  const first = history[0];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full text-ink"
        role="img"
        aria-label={`Trajectoire du score : de ${first.total} à ${last.total} sur 100`}
      >
        {/* Repères 0 / 50 / 100 */}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1={padX}
              x2={w - padX}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <text
              x={w - padX}
              y={y(v) - 3}
              textAnchor="end"
              className="fill-ink/35 font-mono text-[9px]"
            >
              {v}
            </text>
          </g>
        ))}
        {/* Seuil matching */}
        <line
          x1={padX}
          x2={w - padX}
          y1={y(MATCHING_THRESHOLD)}
          y2={y(MATCHING_THRESHOLD)}
          stroke="var(--color-brass)"
          strokeOpacity="0.55"
        />
        <text
          x={padX}
          y={y(MATCHING_THRESHOLD) - 4}
          className="fill-brass font-mono text-[9px]"
        >
          70 · matching
        </text>
        {/* Trajectoire */}
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {history.map((p, i) => (
          <circle
            key={`${p.createdAt}-${i}`}
            cx={x(i)}
            cy={y(p.total)}
            r={i === history.length - 1 ? 3.5 : 2}
            className={i === history.length - 1 ? "fill-rust" : "fill-ink/50"}
          />
        ))}
      </svg>
      <figcaption className="mt-2 flex justify-between font-mono text-[0.65rem] text-ink-soft">
        <span>
          {dateFmt.format(new Date(first.createdAt))} · {first.total}
        </span>
        <span>
          {dateFmt.format(new Date(last.createdAt))} · {last.total}
        </span>
      </figcaption>
    </figure>
  );
}
