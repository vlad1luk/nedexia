"use client";

import { AnimatePresence, motion } from "motion/react";
import { dueLabel, isOpen, isOverdue, type Task } from "@/lib/espace/tasks";

type Props = {
  tasks: Task[];
  newIds: string[];
  onToggle: (task: Task) => void;
  /** cards = point d'étape (grille) · list = rail de séance (colonne) */
  variant?: "cards" | "list";
};

function LeafCheck({ done }: { done: boolean }) {
  return (
    <motion.span
      animate={done ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        done
          ? "border-leaf bg-leaf text-white"
          : "border-navy/25 bg-white hover:border-leaf"
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
          className="h-3.5 w-3.5"
        >
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      )}
    </motion.span>
  );
}

function TaskCard({
  task,
  highlight,
  onToggle,
}: {
  task: Task;
  highlight: boolean;
  onToggle: (task: Task) => void;
}) {
  const done = task.status === "done";
  const overdue = isOverdue(task);

  return (
    <motion.li
      layout
      initial={highlight ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
        highlight
          ? "border-leaf/60 bg-leaf/5 shadow-[0_12px_30px_-18px_rgba(107,158,33,0.5)]"
          : done
            ? "border-leaf/25 bg-leaf/5"
            : "border-navy/10 bg-white hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-[0_14px_30px_-20px_rgba(35,35,96,0.35)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={done ? "Rouvrir l'action" : "Marquer comme faite"}
        className="shrink-0"
      >
        <LeafCheck done={done} />
      </button>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium leading-snug ${
            done ? "text-foreground/45 line-through" : "text-navy"
          }`}
        >
          {task.title}
        </span>
        <span
          className={`mt-1 block text-xs ${
            overdue && !done
              ? "font-semibold text-coral"
              : "text-foreground/45"
          }`}
        >
          {done ? "Fait — le terrain avance" : dueLabel(task.dueDate)}
          {task.source === "eden" && !done ? " · semée par Eden" : ""}
        </span>
      </span>
    </motion.li>
  );
}

/**
 * Cette semaine — les actions en cours (3 max, c'est voulu : le focus
 * avant le volume). Chaque action complétée nourrit le score.
 */
export function WeekPanel({ tasks, newIds, onToggle, variant = "cards" }: Props) {
  const open = tasks
    .filter(isOpen)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const doneRecent = tasks.filter((t) => t.status === "done").slice(0, 3);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = doneCount + open.length;

  if (open.length === 0 && doneRecent.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy/15 bg-white/50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-navy">
          Rien à semer pour l&rsquo;instant
        </p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-foreground/50">
          Répondez à Eden : il vous proposera vos prochaines actions, adaptées
          à votre situation.
        </p>
      </div>
    );
  }

  const grid =
    variant === "cards"
      ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
      : "flex flex-col gap-2.5";

  return (
    <div className="flex flex-col gap-3">
      {open.length > 0 && (
        <ul className={grid}>
          <AnimatePresence initial={false}>
            {open.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                highlight={newIds.includes(task.id)}
                onToggle={onToggle}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {variant === "list" && doneRecent.length > 0 && (
        <div>
          <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-foreground/40">
            Terminées récemment
          </p>
          <ul className="flex flex-col gap-2.5">
            {doneRecent.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                highlight={false}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex items-center gap-3 px-1">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy/10">
            <motion.div
              animate={{
                width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-leaf to-teal"
            />
          </div>
          <span className="text-xs tabular-nums text-foreground/45">
            {doneCount}/{totalCount} faites
          </span>
        </div>
      )}
    </div>
  );
}
