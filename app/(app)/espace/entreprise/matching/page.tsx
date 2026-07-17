"use client";

import Link from "next/link";
import { useEspace } from "./../espace-context";
import { MATCHING_THRESHOLD, PageHeader, Panel } from "./../ui";

/**
 * Matching — le statut de déblocage. « L'accès se cultive » : un palier
 * franchi, pas un badge ludique. Rien ici ne suggère que le matching est
 * ouvert tant que le score ne l'indique pas réellement ; une fois le seuil
 * atteint, la page le constate sobrement et annonce la suite sans inventer
 * de pistes (le moteur de matchmaking n'est pas encore branché).
 */

const VARIABLES = [
  { titre: "Préparation", texte: "Le Score des deux entreprises — personne n'entre avant d'être prêt." },
  { titre: "Intention", texte: "S'allier, céder, acquérir, investir : les intentions doivent se répondre." },
  { titre: "Complémentarité", texte: "Secteurs, forces, territoires — ce que l'un apporte que l'autre n'a pas." },
  { titre: "Capacité financière", texte: "Taille, moyens, valeur documentée, pour une discussion réaliste." },
  { titre: "Compatibilité humaine", texte: "Personnalité, style de décision, rapport à l'héritage." },
] as const;

export default function MatchingPage() {
  const { score } = useEspace();

  const total = score?.total ?? null;
  const unlocked = total != null && total >= MATCHING_THRESHOLD;
  const remaining = total != null ? Math.max(0, MATCHING_THRESHOLD - total) : null;
  const pct = total != null ? Math.min(100, (total / MATCHING_THRESHOLD) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Matching"
        lede="L'accès ne s'achète pas — il se cultive."
        meta={
          unlocked ? (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-moss">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
              Accès ouvert
            </span>
          ) : null
        }
      />

      <div className="flex flex-col gap-4">
        {/* Statut du palier */}
        <Panel label="Votre accès">
          {unlocked ? (
            <>
              <p className="text-sm leading-relaxed text-ink">
                Votre préparation ({total}) franchit le seuil de{" "}
                {MATCHING_THRESHOLD}. L&rsquo;accès au matchmaking est ouvert :
                vos premières mises en relation compatibles arriveront ici, dès
                que le cercle des entreprises prêtes s&rsquo;étoffera.
              </p>
              <p className="mt-3 font-eden text-sm italic text-ink-soft">
                Chaque rencontre proposée sera calculée — jamais un flux à
                faire défiler.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">
                L&rsquo;accès s&rsquo;ouvre à{" "}
                <span className="font-mono tabular-nums text-ink">
                  {MATCHING_THRESHOLD}
                </span>{" "}
                de préparation.
                {remaining != null && remaining > 0 && (
                  <>
                    {" "}
                    Il vous reste{" "}
                    <span className="font-semibold text-ink">
                      {remaining} point{remaining > 1 ? "s" : ""}
                    </span>{" "}
                    à cultiver — chaque action complétée avec Eden vous en
                    rapproche.
                  </>
                )}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-[3px] flex-1 bg-ink/10">
                  <div
                    className="h-full bg-brass transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs tabular-nums text-ink-soft">
                  {total ?? 0}/{MATCHING_THRESHOLD}
                </span>
              </div>
              <Link
                href="/espace/entreprise/programme"
                className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-rust"
              >
                Voir mes prochaines actions
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </>
          )}
        </Panel>

        {/* Comment la compatibilité se calcule */}
        <Panel label="Cinq variables de compatibilité">
          <div className="flex flex-col border-t border-ink/15">
            {VARIABLES.map((v, i) => (
              <article
                key={v.titre}
                className="flex flex-col gap-1 border-b border-ink/15 py-3.5 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="shrink-0 font-eden text-sm italic text-brass sm:w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="shrink-0 text-sm font-semibold text-ink sm:w-48">
                  {v.titre}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">{v.texte}</p>
              </article>
            ))}
          </div>
          <Link
            href="/psychologie"
            className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-rust"
          >
            La couche psychologique, en détail
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Panel>
      </div>
    </>
  );
}
