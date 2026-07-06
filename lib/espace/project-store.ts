/**
 * Accès Supabase aux projets et à leurs dossiers (project_folders).
 * Partagé serveur (Eden, chargement de page) et client (onglet Projets).
 * Toutes les opérations passent par RLS (auth.uid()).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatDossierDate } from "./dossier";
import type {
  ProjectStatus,
  WorkspaceFolder,
  WorkspaceProject,
} from "@/lib/espace/workspace-types";

const PROJECT_COLUMNS =
  "id, name, type, description, objective, status, target_date, created_at";
const FOLDER_COLUMNS = "id, project_id, name, created_at";

const VALID_STATUS: ProjectStatus[] = ["active", "on_hold", "done", "archived"];

function normStatus(value: unknown): ProjectStatus {
  return VALID_STATUS.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : "active";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToProject(row: any): WorkspaceProject {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? "general",
    description: row.description ?? null,
    objective: row.objective ?? null,
    status: normStatus(row.status),
    targetDate: row.target_date ?? null,
    createdAtLabel: formatDossierDate(row.created_at),
  };
}

export function rowToFolder(row: any): WorkspaceFolder {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    createdAtLabel: formatDossierDate(row.created_at),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────── Projets ───────────────

export async function listProjects(
  supabase: SupabaseClient,
  userId: string
): Promise<WorkspaceProject[]> {
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).map(rowToProject);
}

export type ProjectInput = {
  name: string;
  type?: string;
  description?: string | null;
  objective?: string | null;
  status?: ProjectStatus;
  targetDate?: string | null;
};

export async function insertProject(
  supabase: SupabaseClient,
  userId: string,
  input: ProjectInput
): Promise<WorkspaceProject | null> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type ?? "general",
      description: input.description ?? null,
      objective: input.objective ?? null,
      status: input.status ?? "active",
      target_date: input.targetDate ?? null,
    })
    .select(PROJECT_COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToProject(data);
}

export async function updateProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  patch: Partial<ProjectInput>
): Promise<WorkspaceProject | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.objective !== undefined) row.objective = patch.objective;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.targetDate !== undefined) row.target_date = patch.targetDate;

  const { data, error } = await supabase
    .from("projects")
    .update(row)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select(PROJECT_COLUMNS)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProject(data);
}

export async function deleteProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<void> {
  await supabase.from("projects").delete().eq("id", projectId).eq("user_id", userId);
}

// ─────────────── Dossiers ───────────────

export async function listFolders(
  supabase: SupabaseClient,
  userId: string
): Promise<WorkspaceFolder[]> {
  const { data } = await supabase
    .from("project_folders")
    .select(FOLDER_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).map(rowToFolder);
}

export async function insertFolder(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  name: string
): Promise<WorkspaceFolder | null> {
  const { data, error } = await supabase
    .from("project_folders")
    .insert({ user_id: userId, project_id: projectId, name })
    .select(FOLDER_COLUMNS)
    .single();
  if (error || !data) return null;
  return rowToFolder(data);
}

export async function renameFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string,
  name: string
): Promise<WorkspaceFolder | null> {
  const { data, error } = await supabase
    .from("project_folders")
    .update({ name })
    .eq("id", folderId)
    .eq("user_id", userId)
    .select(FOLDER_COLUMNS)
    .maybeSingle();
  if (error || !data) return null;
  return rowToFolder(data);
}

export async function deleteFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string
): Promise<void> {
  await supabase
    .from("project_folders")
    .delete()
    .eq("id", folderId)
    .eq("user_id", userId);
}
