/**
 * Types de domaine « workspace » nécessaires au backend Eden.
 *
 * Extraits de l'UI d'origine (app/_components/espace/dossier/types.ts) pour
 * rendre le backend autonome, sans dépendance à des composants React.
 */

export type ProjectStatus = "active" | "on_hold" | "done" | "archived";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Actif",
  on_hold: "En pause",
  done: "Terminé",
  archived: "Archivé",
};

export type WorkspaceProject = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  objective: string | null;
  status: ProjectStatus;
  targetDate: string | null;
  createdAtLabel: string;
};

export type WorkspaceFolder = {
  id: string;
  projectId: string;
  name: string;
  createdAtLabel: string;
};
