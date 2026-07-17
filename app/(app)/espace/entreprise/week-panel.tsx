"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { dueLabel, isOpen, isOverdue, type Task } from "@/lib/espace/tasks";

type Props = {
  tasks: Task[];
  newIds: string[];
  onToggle: (task: Task) => void;
};

/**
 * Cette semaine — les actions assignées par Eden, cochables directement
 * depuis le tableau de bord. Système carnet : case carrée à l'encre, coche
 * mousse quand c'est fait, échéance en rouille quand c'est en retard (le seul
 * accent d'alerte). Pas de carte flottante, pas de dégradé de progression.
 */
export function WeekPanel({ tasks, newIds, onToggle }: Props) {
  const reduce = useReducedMotion();
  const open = tasks
    .filter(isOpen)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const doneRecent = tasks.filter((t) => t.status === "done").slice(0, 3);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = doneCount + open.length;

  if (open.length === 0 && doneRecent.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 bg-parchment px-5 py-7 text-center">
        <p className="text-sm font-medium text-ink">
          Aucune action en attente
        </p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
          Répondez à Eden : il vous proposera vos prochaines actions, adaptées à
          votre situation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {open.length > 0 && (
        <ul className="flex flex-col border-t border-ink/15">
          <AnimatePresence initial={false}>
            {open.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                highlight={newIds.includes(task.id)}
                reduce={!!reduce}
                onToggle={onToggle}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {doneRecent.length > 0 && (
        <div>
          <p className="pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-soft/70">
            Terminées récemment
          </p>
          <ul className="flex flex-col border-t border-ink/15">
            {doneRecent.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                highlight={false}
                reduce={!!reduce}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-[3px] flex-1 bg-ink/10">
            <div
              className="h-full bg-moss/70 transition-[width] duration-500"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-ink-soft">
            {doneCount}/{totalCount}
          </span>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  highlight,
  reduce,
  onToggle,
}: {
  task: Task;
  highlight: boolean;
  reduce: boolean;
  onToggle: (task: Task) => void;
}) {
  const done = task.status === "done";
  const overdue = isOverdue(task);

  return (
    <motion.li
      layout={!reduce}
      initial={highlight && !reduce ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0 }}
      className={`flex items-start gap-3 border-b border-ink/15 py-3.5 ${
        highlight ? "bg-brass/10" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={done ? "Rouvrir l'action" : "Marquer comme faite"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust ${
          done
            ? "border-moss bg-moss text-parchment"
            : "border-ink/35 bg-transparent hover:border-moss"
        }`}
      >
        {done && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
        )}
      </button>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm leading-snug ${
            done ? "text-ink-soft/70 line-through" : "font-medium text-ink"
          }`}
        >
          {task.title}
        </span>
        <span
          className={`mt-0.5 block text-xs ${
            overdue && !done ? "font-semibold text-rust" : "text-ink-soft"
          }`}
        >
          {done ? "Fait" : dueLabel(task.dueDate)}
          {task.source === "eden" && !done ? " · assignée par Eden" : ""}
        </span>
      </span>
    </motion.li>
  );
}
