"use client";

import type { ProgramMilestone } from "@/lib/espace/program";
import type { ScoreHistoryPoint } from "@/lib/espace/score-history";
import type { Task } from "@/lib/espace/tasks";
import type { DocItem } from "@/app/(app)/espace/entreprise/documents-dock";
import { EspaceProvider, type Message } from "@/app/(app)/espace/entreprise/espace-context";
import { EspaceShell } from "@/app/(app)/espace/entreprise/shell";
import AccueilPage from "@/app/(app)/espace/entreprise/page";
import PreparationPage from "@/app/(app)/espace/entreprise/preparation/page";
import ProgrammePage from "@/app/(app)/espace/entreprise/programme/page";
import FinancementPage from "@/app/(app)/espace/entreprise/financement/page";
import DocumentsPage from "@/app/(app)/espace/entreprise/documents/page";
import MatchingPage from "@/app/(app)/espace/entreprise/matching/page";
import ParametresPage from "@/app/(app)/espace/entreprise/parametres/page";

/**
 * Fixtures de prévisualisation — un dossier vraisemblable (Boréal Mécanique,
 * score 46 → 74) pour juger l'interface sans compte. Les actions réseau
 * (envoyer à Eden, cocher une tâche) échoueront proprement : c'est un décor.
 */

export type PreviewPage =
  | "accueil"
  | "preparation"
  | "programme"
  | "financement"
  | "documents"
  | "matching"
  | "parametres";

const days = (n: number) =>
  new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
const dateOnly = (n: number) => days(n).slice(0, 10);

function mkTask(
  id: string,
  title: string,
  dueInDays: number,
  status: Task["status"],
  milestoneId: string | null
): Task {
  return {
    id,
    title,
    description: null,
    status,
    priority: "medium",
    source: "eden",
    dimensionId: null,
    phaseId: "structuration",
    projectId: null,
    conversationId: null,
    milestoneId,
    dueDate: dateOnly(-dueInDays),
    completedAt: status === "done" ? days(1) : null,
    blockedReason: null,
    proofNote: null,
    createdAt: days(10),
    updatedAt: days(1),
  };
}

const TASKS: Task[] = [
  mkTask("t1", "Compléter le prévisionnel 12 mois pour la Caisse", -1, "pending", "m3"),
  mkTask("t2", "Faire signer la convention d'actionnaires", 3, "pending", "m3"),
  mkTask("t3", "Documenter le processus de soumission client", 6, "pending", "m4"),
  mkTask("t4", "Mettre les états financiers 2025 au propre", 2, "done", "m2"),
  mkTask("t5", "Lister les 10 clients actifs et leur poids", 5, "done", "m2"),
];

const HISTORY: ScoreHistoryPoint[] = [
  { total: 46, tier: "orange", createdAt: days(180) },
  { total: 51, tier: "orange", createdAt: days(150) },
  { total: 58, tier: "jaune", createdAt: days(110) },
  { total: 63, tier: "jaune", createdAt: days(75) },
  { total: 68, tier: "jaune", createdAt: days(40) },
  { total: 74, tier: "jaune", createdAt: days(6) },
];

const DOCS: DocItem[] = [
  { id: "d1", name: "États financiers 2025.pdf", size: 842_000, analysisStatus: "done", docType: "États financiers" },
  { id: "d2", name: "Plan d'affaires — Boréal.pdf", size: 1_204_000, analysisStatus: "done", docType: "Plan d'affaires" },
  { id: "d3", name: "Note de préparation — rencontre Caisse.md", size: 14_000, analysisStatus: "unsupported", docType: null },
  { id: "d4", name: "Organigramme 2026.pdf", size: 312_000, analysisStatus: "processing", docType: null },
];

const MILESTONES: ProgramMilestone[] = [
  { id: "m1", criterionId: "c1", phaseId: "diagnostic", title: "Diagnostic initial complété", position: 0, targetDate: null, status: "done", completedAt: days(178), criterionStatus: null },
  { id: "m2", criterionId: "c2", phaseId: "fondations", title: "États financiers à jour et lisibles", position: 1, targetDate: null, status: "done", completedAt: days(60), criterionStatus: null },
  { id: "m3", criterionId: "c3", phaseId: "structuration", title: "Gouvernance signée (convention, registres)", position: 2, targetDate: dateOnly(-21), status: "in_progress", completedAt: null, criterionStatus: null },
  { id: "m4", criterionId: "c4", phaseId: "structuration", title: "Processus clés documentés", position: 3, targetDate: dateOnly(-45), status: "todo", completedAt: null, criterionStatus: null },
  { id: "m5", criterionId: "c5", phaseId: "cercle", title: "Dossier prêt pour le matchmaking", position: 4, targetDate: null, status: "todo", completedAt: null, criterionStatus: null },
];

const MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Bonjour Vlad. Depuis notre dernier point, les états financiers 2025 sont classés et votre score est passé de 68 à 74 — le seuil du matchmaking est franchi.\n\nCe qui mérite votre attention cette semaine : le prévisionnel pour la Caisse est dû demain, et la convention d'actionnaires attend deux signatures. Voulez-vous qu'on commence par le prévisionnel ?",
  },
  { role: "user", content: "Oui, commençons par le prévisionnel. La Caisse veut trois scénarios." },
  {
    role: "assistant",
    content:
      "Très bien. Pour trois scénarios (prudent, réaliste, croissance), il me faut vos hypothèses de ventes T3–T4 et le calendrier d'embauche. Je prépare la structure du document — comptez 25 minutes de votre côté pour valider les chiffres.",
  },
];

export function PreviewClient({ page }: { page: PreviewPage }) {
  const pages: Record<PreviewPage, React.ReactNode> = {
    accueil: <AccueilPage />,
    preparation: <PreparationPage />,
    programme: <ProgrammePage />,
    financement: <FinancementPage />,
    documents: <DocumentsPage />,
    matching: <MatchingPage />,
    parametres: <ParametresPage />,
  };

  return (
    <div className="flex h-svh flex-col bg-background">
      <main className="min-h-0 flex-1">
        <EspaceProvider
          displayName="Vlad"
          companyName="Boréal Mécanique inc."
          email="vlad@borealmecanique.ca"
          dateLabel="jeudi 16 juillet"
          hasDiagnostic
          initialScore={{ total: 74, tier: "jaune" }}
          scoreDimensions={{
            finances: 78,
            independance: 71,
            structure: 68,
            clarte: 82,
            reputation: 74,
          }}
          initialScoreHistory={HISTORY}
          initialTasks={TASKS}
          initialDocs={DOCS}
          initialMilestones={MILESTONES}
          initialConversationId="preview"
          initialMessages={MESSAGES}
          needsCheckin={false}
        >
          <EspaceShell>{pages[page]}</EspaceShell>
        </EspaceProvider>
      </main>
    </div>
  );
}
