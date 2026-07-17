"use client";

import Link from "next/link";
import { TIER_LABELS } from "@/lib/espace/types";
import { isOpen, isOverdue, dueLabel } from "@/lib/espace/tasks";
import { useEspace } from "./espace-context";
import { DetailLink, MATCHING_THRESHOLD, PageHeader, Panel } from "./ui";

/**
 * Accueil — la vue d'ensemble condensée. Un résumé qui donne envie d'aller
 * au détail : score et variation, prochaine action prioritaire, alertes
 * réelles s'il y en a. Chaque bloc renvoie vers sa page ; rien n'est
 * dupliqué en entier ici.
 */
export default function AccueilPage() {
  const {
    displayName,
    dateLabel,
    hasDiagnostic,
    score,
    scoreHistory,
    tasks,
    toggleTask,
    financement,
  } = useEspace();

  if (!hasDiagnostic) {
    return (
      <>
        <PageHeader title={`Bienvenue, ${displayName}`} lede={dateLabel} />
        <div className="border border-ink/15 bg-parchment p-8 text-center">
          <p className="font-eden text-xl text-ink">
            Tout commence par un diagnostic.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            Sept minutes, sans compte requis, sans document. Eden construira
            ensuite votre dossier, votre score de préparation et votre
            programme.
          </p>
          <Link
            href="/espace"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
            }}
            className="relative mt-6 inline-flex items-center gap-2 bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-parchment before:absolute before:inset-x-0 before:bottom-0 before:h-[2px] before:bg-rust before:content-[''] hover:bg-[#232e3d]"
          >
            Faire mon diagnostic · 7 min
          </Link>
        </div>
      </>
    );
  }

  const openTasks = tasks
    .filter(isOpen)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const nextTask = openTasks[0] ?? null;
  const overdueCount = openTasks.filter(isOverdue).length;
  const delta =
    scoreHistory.length >= 2
      ? scoreHistory[scoreHistory.length - 1].total - scoreHistory[0].total
      : 0;
  const matchingUnlocked = score != null && score.total >= MATCHING_THRESHOLD;

  return (
    <>
      <PageHeader
        title={`Bonjour ${displayName}`}
        meta={<span className="hidden text-sm text-ink-soft sm:block">{dateLabel}</span>}
      />

      {/* Alertes — seulement s'il y en a */}
      {overdueCount > 0 && (
        <Link
          href="/espace/entreprise/programme"
          className="mb-4 flex items-baseline gap-3 border border-rust/40 bg-rust/5 px-4 py-3 transition-colors hover:bg-rust/10"
        >
          <span aria-hidden className="h-2 w-2 shrink-0 translate-y-[-1px] bg-rust" />
          <span className="text-sm font-medium text-rust">
            {overdueCount} action{overdueCount > 1 ? "s" : ""} en retard
          </span>
          <span className="ml-auto shrink-0 text-xs text-ink-soft">
            Voir le programme →
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-4">
        {/* Score condensé */}
        <Panel
          label="Préparation"
          meta={
            score ? (
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {TIER_LABELS[score.tier]}
              </span>
            ) : null
          }
        >
          {score ? (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-eden text-5xl font-medium leading-none text-ink tabular-nums">
                  {score.total}
                </span>
                <span className="font-eden text-lg italic text-ink-soft">/100</span>
                {delta !== 0 && (
                  <span className="ml-auto text-sm text-ink-soft">
                    <span
                      className={`font-mono tabular-nums ${
                        delta > 0 ? "text-moss" : "text-rust"
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>{" "}
                    depuis le départ
                  </span>
                )}
              </div>
              <DetailLink href="/espace/entreprise/preparation">
                Voir le détail par dimension
              </DetailLink>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Votre score apparaîtra après le diagnostic.
            </p>
          )}
        </Panel>

        {/* Prochaine action */}
        <Panel
          label="Prochaine action"
          meta={
            openTasks.length > 1 ? (
              <span className="font-mono text-xs tabular-nums text-ink-soft">
                {openTasks.length} en cours
              </span>
            ) : null
          }
        >
          {nextTask ? (
            <>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleTask(nextTask)}
                  aria-label="Marquer comme faite"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-ink/35 transition-colors hover:border-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug text-ink">
                    {nextTask.title}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isOverdue(nextTask) ? "font-semibold text-rust" : "text-ink-soft"
                    }`}
                  >
                    {dueLabel(nextTask.dueDate)}
                    {nextTask.source === "eden" ? " · assignée par Eden" : ""}
                  </span>
                </span>
              </div>
              <DetailLink href="/espace/entreprise/programme">
                Tout le programme
              </DetailLink>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Aucune action en attente. Répondez à Eden pour recevoir les
              prochaines.
            </p>
          )}
        </Panel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Financement condensé */}
          <Panel label="Financement">
            {financement ? (
              <p className="text-sm leading-relaxed text-ink">
                {financement.programCount} programme
                {financement.programCount > 1 ? "s" : ""} identifié
                {financement.programCount > 1 ? "s" : ""} · prochaine étape :{" "}
                {financement.nextStep}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-ink-soft">
                Aucun dossier suivi pour l&rsquo;instant.
              </p>
            )}
            <DetailLink href="/espace/entreprise/financement">
              {financement ? "Suivre le dossier" : "Explorer le financement"}
            </DetailLink>
          </Panel>

          {/* Matching condensé */}
          <Panel
            label="Matching"
            meta={
              matchingUnlocked ? (
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-moss">
                  Accès ouvert
                </span>
              ) : null
            }
          >
            <p className="text-sm leading-relaxed text-ink-soft">
              {matchingUnlocked
                ? "Votre préparation ouvre l'accès au matching."
                : score
                  ? `S'ouvre à ${MATCHING_THRESHOLD} — encore ${Math.max(
                      0,
                      MATCHING_THRESHOLD - score.total
                    )} point${MATCHING_THRESHOLD - score.total > 1 ? "s" : ""} à cultiver.`
                  : `S'ouvre à ${MATCHING_THRESHOLD} de préparation.`}
            </p>
            <DetailLink href="/espace/entreprise/matching">Voir le statut</DetailLink>
          </Panel>
        </div>
      </div>
    </>
  );
}
