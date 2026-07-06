/**
 * Accès Supabase aux tâches — helpers partagés serveur (diagnostic, Eden) et
 * client (workspace). Toutes les opérations passent par RLS (auth.uid()).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { SeedTask } from "./task-templates";
import {
  rowToTask,
  type Task,
  type TaskEventType,
  type TaskStatus,
} from "./tasks";

const TASK_COLUMNS =
  "id, title, description, status, priority, source, dimension_id, phase_id, project_id, conversation_id, milestone_id, due_date, completed_at, blocked_reason, proof_note, created_at, updated_at";

export async function listTasks(
  supabase: SupabaseClient,
  userId: string
): Promise<Task[]> {
  const { data } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  return (data ?? []).map(rowToTask);
}

export async function logTaskEvent(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  eventType: TaskEventType,
  payload?: Record<string, unknown>
): Promise<void> {
  await supabase.from("task_events").insert({
    task_id: taskId,
    user_id: userId,
    event_type: eventType,
    payload: payload ?? null,
  });
}

type InsertContext = {
  diagnosticId?: string | null;
  conversationId?: string | null;
  projectId?: string | null;
  milestoneId?: string | null;
  source: "eden" | "user" | "system";
};

/** Insère un lot de tâches et journalise un événement `created` par tâche. */
export async function insertTasks(
  supabase: SupabaseClient,
  userId: string,
  seeds: SeedTask[],
  ctx: InsertContext
): Promise<Task[]> {
  if (seeds.length === 0) return [];

  const rows = seeds.map((s) => ({
    user_id: userId,
    diagnostic_id: ctx.diagnosticId ?? null,
    conversation_id: ctx.conversationId ?? null,
    project_id: ctx.projectId ?? null,
    milestone_id: s.milestoneId ?? ctx.milestoneId ?? null,
    title: s.title,
    description: s.description || null,
    status: "pending",
    priority: s.priority,
    source: ctx.source,
    dimension_id: s.dimensionId,
    phase_id: s.phaseId,
    due_date: s.dueDate,
  }));

  const { data, error } = await supabase
    .from("tasks")
    .insert(rows)
    .select(TASK_COLUMNS);

  if (error || !data) return [];

  const tasks = data.map(rowToTask);
  await Promise.all(
    tasks.map((t) =>
      logTaskEvent(supabase, userId, t.id, "created", {
        title: t.title,
        source: t.source,
      })
    )
  );
  return tasks;
}

type StatusChange = {
  status?: TaskStatus;
  dueDate?: string;
  blockedReason?: string | null;
  priority?: "high" | "medium" | "low";
  title?: string;
  description?: string | null;
  proofNote?: string | null;
  milestoneId?: string | null;
};

function eventForStatus(status: TaskStatus): TaskEventType {
  switch (status) {
    case "done":
      return "completed";
    case "skipped":
      return "skipped";
    case "blocked":
      return "blocked";
    case "pending":
    case "in_progress":
      return "reopened";
    default:
      return "updated";
  }
}

/** Met à jour une tâche et journalise l'événement adéquat. */
export async function updateTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  change: StatusChange
): Promise<Task | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  let eventType: TaskEventType = "updated";

  if (change.status) {
    patch.status = change.status;
    patch.completed_at = change.status === "done" ? new Date().toISOString() : null;
    if (change.status !== "blocked") patch.blocked_reason = null;
    eventType = eventForStatus(change.status);
  }
  if (change.dueDate !== undefined) {
    patch.due_date = change.dueDate;
    if (!change.status) eventType = "rescheduled";
  }
  if (change.blockedReason !== undefined) patch.blocked_reason = change.blockedReason;
  if (change.priority !== undefined) patch.priority = change.priority;
  if (change.title !== undefined) patch.title = change.title;
  if (change.description !== undefined) patch.description = change.description;
  if (change.proofNote !== undefined) patch.proof_note = change.proofNote;
  if (change.milestoneId !== undefined) patch.milestone_id = change.milestoneId;

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select(TASK_COLUMNS)
    .maybeSingle();

  if (error || !data) return null;

  const task = rowToTask(data);
  await logTaskEvent(supabase, userId, taskId, eventType, {
    status: task.status,
    dueDate: task.dueDate,
  });
  return task;
}

export async function deleteTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
): Promise<void> {
  await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);
}
