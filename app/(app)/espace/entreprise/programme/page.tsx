"use client";

import type { ProgramMilestone } from "@/lib/espace/program";
import { isOpen } from "@/lib/espace/tasks";
import { useEspace } from "./../espace-context";
import { WeekPanel } from "./../week-panel";
import { PageHeader, Panel } from "./../ui";

/**
 * Programme — l'itinéraire « de la graine à la récolte » : les jalons du
 * parcours, ce qui est fait, en cours, à venir, et les actions de la semaine
 * rattachées. Les tâches sont cochables ici même ; le score et les badges se
 * mettent à jour partout (provider).
 */

const dateFmt = new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long" });

const STATUS_LABEL: Record<ProgramMilestone["status"], string> = {
  done: "Fait",
  in_progress: "En cours",
  todo: "À venir",
};

export default function ProgrammePage() {
  const { milestones, tasks, newTaskIds, toggleTask, openTaskCount, hasDiagnostic } =
    useEspace();

  const done = milestones.filter((m) => m.status === "done").length;

  if (!hasDiagnostic) {
    return (
      <PageHeader
        title="Programme"
        lede="Votre programme sera établi après le diagnostic — jalon par jalon, de la graine à la récolte."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Programme"
        lede="De la graine à la récolte — votre itinéraire, jalon par jalon."
        meta={
          milestones.length > 0 ? (
            <span className="font-mono text-sm tabular-nums text-ink-soft">
              {done}/{milestones.length} jalons
            </span>
          ) : null
        }
      />

      <div className="flex flex-col gap-4">
        {/* Les actions de la semaine — cochables directement */}
        <Panel
          label="Cette semaine"
          meta={
            openTaskCount > 0 ? (
              <span className="font-mono text-xs tabular-nums text-ink-soft">
                {openTaskCount} en cours
              </span>
            ) : null
          }
        >
          <WeekPanel tasks={tasks} newIds={newTaskIds} onToggle={toggleTask} />
        </Panel>

        {/* Les jalons */}
        {milestones.length > 0 && (
          <Panel label="Les jalons">
            <ol className="flex flex-col">
              {milestones.map((m, i) => {
                const isDone = m.status === "done";
                const isCurrent =
                  m.status === "in_progress" ||
                  (m.status === "todo" &&
                    milestones.slice(0, i).every((x) => x.status === "done"));
                const attached = tasks.filter(
                  (t) => t.milestoneId === m.id && isOpen(t)
                );
                return (
                  <li
                    key={m.id}
                    className="relative flex gap-4 border-b border-ink/15 py-5 last:border-b-0"
                  >
                    {/* Fil vertical */}
                    {i < milestones.length - 1 && (
                      <span
                        aria-hidden
                        className={`absolute left-[7px] top-11 h-[calc(100%-24px)] w-px ${
                          isDone ? "bg-moss/50" : "bg-ink/15"
                        }`}
                      />
                    )}
                    <span
                      className={`relative mt-1 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border ${
                        isDone
                          ? "border-moss bg-moss"
                          : isCurrent
                            ? "border-rust bg-transparent"
                            : "border-ink/25 bg-transparent"
                      }`}
                    >
                      {isDone && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-parchment)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-2 w-2"
                        >
                          <path d="M4 12.5l5 5L20 6.5" />
                        </svg>
                      )}
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rust" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3
                          className={`text-[0.95rem] leading-snug ${
                            isDone
                              ? "text-ink-soft/70"
                              : isCurrent
                                ? "font-semibold text-ink"
                                : "text-ink-soft"
                          }`}
                        >
                          {m.title}
                        </h3>
                        <span
                          className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                            isDone
                              ? "text-moss"
                              : isCurrent
                                ? "text-rust"
                                : "text-ink-soft/60"
                          }`}
                        >
                          {STATUS_LABEL[isCurrent && !isDone ? "in_progress" : m.status]}
                        </span>
                        {m.targetDate && !isDone && (
                          <span className="ml-auto font-mono text-xs tabular-nums text-ink-soft">
                            cible : {dateFmt.format(new Date(`${m.targetDate}T12:00:00`))}
                          </span>
                        )}
                      </div>

                      {/* Actions rattachées au jalon */}
                      {attached.length > 0 && (
                        <ul className="mt-2.5 flex flex-col gap-1.5">
                          {attached.map((t) => (
                            <li key={t.id} className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => toggleTask(t)}
                                aria-label="Marquer comme faite"
                                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-ink/35 transition-colors hover:border-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
                              />
                              <span className="text-sm leading-snug text-ink-soft">
                                {t.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        )}

        {milestones.length === 0 && (
          <Panel label="Les jalons">
            <p className="text-sm leading-relaxed text-ink-soft">
              Votre programme se construit avec Eden : au fil des échanges, les
              jalons de votre parcours apparaîtront ici, datés et ordonnés.
            </p>
          </Panel>
        )}
      </div>
    </>
  );
}
