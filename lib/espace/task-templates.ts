/**
 * Templates de tâches Nedexia.
 *
 * - `buildInitialTasks` : les 3 tâches « système » générées à la complétion
 *   du diagnostic (dimension la plus faible + intention + enrichissement).
 * - `INTENTION_TASK_TEMPLATES` : banque de tâches par intention dont Eden peut
 *   s'inspirer (il personnalise, ne recopie pas mot à mot).
 *
 * À valider avec Jérôme (réf. document MVP, §13).
 */

import { getWeakestDimension } from "./dossier";
import { getCurrentPhaseIndex, ACCOMP_PHASES } from "./dossier";
import type { PhaseId, TaskPriority } from "./tasks";
import { dueDateInDays } from "./tasks";
import {
  DIMENSION_LABELS,
  type DimensionId,
  type DiagnosticSubmission,
  type Intention,
} from "./types";

export type SeedTask = {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  dimensionId: DimensionId | null;
  phaseId: PhaseId | null;
  /** Jalon du programme servi par cette action (optionnel). */
  milestoneId?: string | null;
};

// ─────────────── Actions par dimension (pour la tâche « dimension faible ») ───────────────

const DIMENSION_TASK: Record<DimensionId, { title: string; detail: string }> = {
  clarte: {
    title: "Formuler votre offre en une seule phrase",
    detail:
      "Ce que vous faites, pour qui, et pourquoi c'est utile. C'est la base de toute conversation commerciale ou stratégique.",
  },
  independance: {
    title: "Documenter 2 processus clés de l'entreprise",
    detail:
      "Réduire la dépendance au fondateur commence par écrire comment tournent vos opérations essentielles.",
  },
  finances: {
    title: "Mettre à jour vos chiffres clés (marge, CA, dépendance client)",
    detail:
      "Connaître précisément votre marge nette et la part de votre plus gros client est le point de départ de toute décision.",
  },
  structure: {
    title: "Vérifier et compléter votre structure juridique",
    detail:
      "Fiche REQ à jour, dirigeants identifiés, statuts conformes — le socle qui rassure partenaires et financiers.",
  },
  reputation: {
    title: "Réunir 3 preuves de crédibilité (témoignages, références)",
    detail:
      "La preuve sociale rassure : collectez 3 témoignages clients ou références récentes.",
  },
};

// ─────────────── Tâche orientée par l'intention ───────────────

const INTENTION_TASK: Partial<Record<Intention, { title: string; detail: string }>> = {
  commerce: {
    title: "Identifier 3 entreprises clientes idéales à approcher",
    detail:
      "Nommez précisément 3 prospects B2B qui ont besoin de ce que vous offrez. On bâtit votre approche à partir de là.",
  },
  cession: {
    title: "Lister les documents clés pour une éventuelle cession",
    detail:
      "États financiers, contrats importants, organigramme : la liste de ce qu'un acquéreur voudra voir.",
  },
  acquisition: {
    title: "Définir votre profil de cible (secteur, taille, budget)",
    detail:
      "Une acquisition réussie commence par savoir exactement ce que vous cherchez.",
  },
  alliance: {
    title: "Écrire ce que vous cherchez chez un partenaire",
    detail:
      "Technologie, marché, capacité, ressource : précisez la complémentarité recherchée.",
  },
  structuration: {
    title: "Nommer le problème n°1 de votre entreprise aujourd'hui",
    detail:
      "Si vous deviez régler une seule chose ce trimestre, ce serait quoi ? On part de là.",
  },
};

function phaseIdForScore(scoreTotal: number): PhaseId {
  const idx = getCurrentPhaseIndex(scoreTotal);
  return (ACCOMP_PHASES[idx]?.id as PhaseId) ?? "fondations";
}

/**
 * Trois tâches initiales à la complétion du diagnostic :
 * 1. la dimension la plus faible (J+7, haute) ;
 * 2. l'intention principale (J+14, moyenne) ;
 * 3. enrichir le dossier avec un document clé (J+21, moyenne).
 */
export function buildInitialTasks(
  submission: DiagnosticSubmission
): SeedTask[] {
  const tasks: SeedTask[] = [];
  const scoreTotal = submission.score?.total ?? 0;
  const phaseId = phaseIdForScore(scoreTotal);

  // 1 — Dimension la plus faible
  if (submission.score) {
    const weakest = getWeakestDimension(submission.score);
    if (weakest) {
      const t = DIMENSION_TASK[weakest];
      tasks.push({
        title: t.title,
        description: `Dimension la plus fragile : ${DIMENSION_LABELS[weakest]}. ${t.detail}`,
        dueDate: dueDateInDays(7),
        priority: "high",
        dimensionId: weakest,
        phaseId,
      });
    }
  }

  // 2 — Intention principale
  const intentionTask = submission.intention
    ? INTENTION_TASK[submission.intention]
    : undefined;
  if (intentionTask) {
    tasks.push({
      title: intentionTask.title,
      description: intentionTask.detail,
      dueDate: dueDateInDays(14),
      priority: "medium",
      dimensionId: null,
      phaseId,
    });
  }

  // 3 — Enrichir le dossier
  tasks.push({
    title: "Ajouter un document clé à votre dossier",
    description:
      "Téléversez un document important (états financiers, contrat clé, présentation). Plus votre dossier est riche, plus Eden est précis.",
    dueDate: dueDateInDays(21),
    priority: "medium",
    dimensionId: null,
    phaseId,
  });

  return tasks;
}

/** Banque de tâches par intention — référence pour Eden (non imposée). */
export const INTENTION_TASK_TEMPLATES: Record<Intention, string[]> = {
  commerce: [
    "Identifier 3 prospects B2B cibles",
    "Tester votre pitch auprès d'un client existant",
    "Mesurer la part de CA de votre plus gros client",
    "Évaluer votre capacité à doubler le volume",
  ],
  alliance: [
    "Lister ce que vous cherchez chez un partenaire",
    "Inventorier vos actifs mobilisables",
    "Vérifier que l'entreprise tourne sans vous une semaine",
    "Préparer un document de présentation pour un partenaire",
  ],
  cession: [
    "Réunir les 3 derniers bilans financiers",
    "Estimer une fourchette de valorisation",
    "Documenter un plan de relève",
    "Réduire la dépendance au fondateur sur 1 fonction clé",
  ],
  acquisition: [
    "Définir vos critères de cible (secteur, taille, géo)",
    "Identifier votre capacité de financement",
    "Rencontrer BDC ou Desjardins",
    "Établir une liste de 5 cibles potentielles",
  ],
  structuration: [
    "Nommer le problème principal de l'entreprise",
    "Clarifier vos priorités du trimestre",
    "Mettre à jour vos chiffres financiers clés",
    "Identifier la dimension la plus fragile à renforcer",
  ],
  exploration: [
    "Clarifier votre objectif principal à 5 ans",
    "Faire le point sur ce qui vous préoccupe le plus",
    "Compléter votre diagnostic pour affiner la lecture",
  ],
};
