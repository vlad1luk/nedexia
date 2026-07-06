/**
 * Plan d'action Nedexia — modèle de tâches.
 *
 * Une tâche transforme un conseil d'Eden en action datée et suivie.
 * Ce module définit les types, le mapping ligne Supabase ↔ objet, et les
 * helpers de date / regroupement utilisés côté serveur comme client.
 */

import type { DimensionId } from "./types";

// ─────────────── Types ───────────────

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "skipped"
  | "blocked";

export type TaskPriority = "high" | "medium" | "low";

export type TaskSource = "eden" | "user" | "system";

export type PhaseId =
  | "diagnostic"
  | "fondations"
  | "structuration"
  | "optimisation"
  | "cercle";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  dimensionId: DimensionId | null;
  phaseId: PhaseId | null;
  projectId: string | null;
  conversationId: string | null;
  /** Jalon du programme auquel cette action est rattachée. */
  milestoneId: string | null;
  /** ISO date (yyyy-mm-dd) */
  dueDate: string;
  completedAt: string | null;
  blockedReason: string | null;
  /** Preuve de complétion (« comment on sait que c'est fait »). */
  proofNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskEventType =
  | "created"
  | "updated"
  | "completed"
  | "skipped"
  | "blocked"
  | "rescheduled"
  | "reopened";

// ─────────────── Libellés FR ───────────────

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "À faire",
  in_progress: "En cours",
  done: "Fait",
  skipped: "Ignorée",
  blocked: "Bloquée",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Priorité haute",
  medium: "Priorité moyenne",
  low: "Priorité basse",
};

export const TASK_SOURCE_LABELS: Record<TaskSource, string> = {
  eden: "Proposée par Eden",
  user: "Vous",
  system: "Nedexia",
};

export const PHASE_LABELS: Record<PhaseId, string> = {
  diagnostic: "Diagnostic",
  fondations: "Fondations",
  structuration: "Structuration",
  optimisation: "Optimisation",
  cercle: "Cercle Nedexia",
};

/** Phase d'accompagnement déduite du score (cohérent avec la roadmap). */
export function phaseIdForScore(scoreTotal: number): PhaseId {
  if (scoreTotal >= 80) return "cercle";
  if (scoreTotal >= 60) return "optimisation";
  if (scoreTotal >= 40) return "structuration";
  if (scoreTotal > 0) return "fondations";
  return "diagnostic";
}

/** Une tâche est-elle « ouverte » (compte dans le plan actif) ? */
export function isOpen(task: Pick<Task, "status">): boolean {
  return task.status === "pending" || task.status === "in_progress";
}

/** Une tâche est-elle terminée d'une manière ou d'une autre ? */
export function isClosed(task: Pick<Task, "status">): boolean {
  return task.status === "done" || task.status === "skipped";
}

// ─────────────── Mapping Supabase ───────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    source: row.source as TaskSource,
    dimensionId: (row.dimension_id as DimensionId | null) ?? null,
    phaseId: (row.phase_id as PhaseId | null) ?? null,
    projectId: row.project_id ?? null,
    conversationId: row.conversation_id ?? null,
    milestoneId: row.milestone_id ?? null,
    dueDate: toDateString(row.due_date),
    completedAt: row.completed_at ?? null,
    blockedReason: row.blocked_reason ?? null,
    proofNote: row.proof_note ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────── Helpers de date ───────────────

/** Normalise une valeur de date Supabase (date ou timestamp) en yyyy-mm-dd. */
export function toDateString(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/** Date du jour en yyyy-mm-dd (heure locale du serveur/navigateur). */
export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** Ajoute `days` jours à aujourd'hui et renvoie une date yyyy-mm-dd. */
export function dueDateInDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** Nombre de jours entre aujourd'hui et une échéance (négatif = en retard). */
/** Nombre de jours entiers écoulés depuis un instant ISO (≥ 0). */
export function daysSince(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  );
}

export function daysUntil(dueDate: string): number {
  const today = new Date(todayISO()).getTime();
  const due = new Date(toDateString(dueDate)).getTime();
  return Math.round((due - today) / 86_400_000);
}

export function isOverdue(task: Pick<Task, "status" | "dueDate">): boolean {
  return isOpen(task) && daysUntil(task.dueDate) < 0;
}

export function isDueToday(task: Pick<Task, "status" | "dueDate">): boolean {
  return isOpen(task) && daysUntil(task.dueDate) === 0;
}

/** Étiquette d'échéance lisible en français québécois. */
export function dueLabel(dueDate: string): string {
  const n = daysUntil(dueDate);
  if (n < -1) return `En retard de ${Math.abs(n)} jours`;
  if (n === -1) return "En retard d'un jour";
  if (n === 0) return "Aujourd'hui";
  if (n === 1) return "Demain";
  if (n <= 7) return `Dans ${n} jours`;
  return new Date(toDateString(dueDate)).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
  });
}

// ─────────────── Regroupement ───────────────

export type TaskBucket = "overdue" | "today" | "week" | "later" | "done";

export function bucketOf(task: Task): TaskBucket {
  if (isClosed(task) || task.status === "blocked") {
    return task.status === "done" ? "done" : "later";
  }
  const n = daysUntil(task.dueDate);
  if (n < 0) return "overdue";
  if (n === 0) return "today";
  if (n <= 7) return "week";
  return "later";
}

export const BUCKET_LABELS: Record<TaskBucket, string> = {
  overdue: "En retard",
  today: "Aujourd'hui",
  week: "Cette semaine",
  later: "À venir",
  done: "Terminées",
};

/** Tâches ouvertes dont l'échéance tombe dans les 7 prochains jours (ou en retard). */
export function thisWeekTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => isOpen(t) && daysUntil(t.dueDate) <= 7)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function openTasks(tasks: Task[]): Task[] {
  return tasks.filter(isOpen);
}

export function overdueTasks(tasks: Task[]): Task[] {
  return tasks.filter(isOverdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Compte les tâches ouvertes créées par Eden cette semaine (≤ 7 jours). */
export function edenTasksThisWeekCount(tasks: Task[]): number {
  return tasks.filter(
    (t) => t.source === "eden" && isOpen(t) && daysUntil(t.dueDate) <= 7
  ).length;
}

/** Taux de complétion sur une fenêtre (done / clôturées + ouvertes échues). */
export function completionRate(tasks: Task[]): number {
  const considered = tasks.filter(
    (t) => t.status === "done" || t.status === "skipped" || isOverdue(t)
  );
  if (considered.length === 0) return 0;
  const done = considered.filter((t) => t.status === "done").length;
  return Math.round((done / considered.length) * 100);
}
