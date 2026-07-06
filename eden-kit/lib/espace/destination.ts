/**
 * Le « point B » — la destination du dirigeant selon son intention.
 *
 * Un tuteur ne se contente pas de réagir : il connaît l'état d'arrivée et
 * mesure en permanence la distance qui reste. Ce module définit, pour chaque
 * intention, ce que « prêt » veut dire concrètement (critères vérifiables),
 * et évalue chacun depuis les données réelles du dossier.
 *
 * Trois états par critère :
 *   - met      : atteint d'après les données.
 *   - partial  : entamé / à consolider.
 *   - unmet    : pas encore — à travailler.
 *   - unknown  : pas évaluable depuis les données → Eden le découvre en
 *                conversation, puis le mémorise (outil remember).
 */

import type { DossierDocSignal } from "./dossier";
import type { PhaseId } from "./tasks";
import {
  INTENTION_LABELS,
  type DiagnosticSubmission,
  type DimensionId,
  type Intention,
  type Scale,
} from "./types";

export type CriterionStatus = "met" | "partial" | "unmet" | "unknown";

export type DestinationCriterion = {
  id: string;
  label: string;
  status: CriterionStatus;
  /** Phase du parcours à laquelle ce critère appartient (pour le séquençage). */
  phase: PhaseId;
};

export type Destination = {
  intention: Intention;
  intentionLabel: string;
  /** Le point B en une ligne. */
  label: string;
  /** Ce que « prêt » signifie concrètement. */
  summary: string;
  criteria: DestinationCriterion[];
  /** Critères pleinement atteints. */
  metCount: number;
  total: number;
  /** Avancement 0–100 (partiel compté pour moitié, inconnu pour zéro). */
  progressPct: number;
};

// ─────────────── Helpers d'évaluation ───────────────

/** Une dimension de score (0–100) → statut de critère. */
function dimStatus(v: number | null | undefined): CriterionStatus {
  if (v == null) return "unknown";
  if (v >= 67) return "met";
  if (v >= 40) return "partial";
  return "unmet";
}

/** Une échelle 1–3 (3 = bon) → statut de critère. */
function scaleStatus(s: Scale | undefined): CriterionStatus {
  if (s === 3) return "met";
  if (s === 2) return "partial";
  if (s === 1) return "unmet";
  return "unknown";
}

/** Garde le meilleur des deux statuts (pour combiner déclaratif + dimension). */
function bestOf(a: CriterionStatus, b: CriterionStatus): CriterionStatus {
  const rank: Record<CriterionStatus, number> = {
    unknown: 0,
    unmet: 1,
    partial: 2,
    met: 3,
  };
  return rank[a] >= rank[b] ? a : b;
}

const always =
  (status: CriterionStatus) =>
  (): CriterionStatus =>
    status;

/** Contexte d'évaluation dérivé une fois depuis le dossier. */
type EvalCtx = {
  dims: Partial<Record<DimensionId, number | null>>;
  hasOffre: boolean;
  hasPublicCible: boolean;
  hasStructure: boolean;
  finVisibilite?: Scale;
  finDependance?: Scale;
  docFinances: boolean;
  docPlan: boolean;
  docOrg: boolean;
};

function financeStatus(c: EvalCtx): CriterionStatus {
  return bestOf(dimStatus(c.dims.finances), scaleStatus(c.finVisibilite));
}

function offerStatus(c: EvalCtx): CriterionStatus {
  return c.hasOffre ? bestOf("partial", dimStatus(c.dims.clarte)) : dimStatus(c.dims.clarte);
}

function structureStatus(c: EvalCtx): CriterionStatus {
  return c.hasStructure ? bestOf("partial", dimStatus(c.dims.structure)) : dimStatus(c.dims.structure);
}

// ─────────────── Définition du point B par intention ───────────────

type CriterionDef = {
  id: string;
  label: string;
  phase: PhaseId;
  evaluate: (c: EvalCtx) => CriterionStatus;
};

type DestinationDef = {
  label: string;
  summary: string;
  criteria: CriterionDef[];
};

const DESTINATIONS: Record<Intention, DestinationDef> = {
  commerce: {
    label: "prêt à aller chercher des clients B2B en confiance",
    summary:
      "une offre limpide, une clientèle cible définie, des finances lisibles et une dépendance client maîtrisée — le profil qu'on peut présenter à des prospects sérieux.",
    criteria: [
      {
        id: "offre",
        label: "Offre formulée en une phrase claire",
        phase: "fondations",
        evaluate: offerStatus,
      },
      {
        id: "cible",
        label: "Clientèle cible définie",
        phase: "fondations",
        evaluate: (c) => (c.hasPublicCible ? "met" : "unknown"),
      },
      {
        id: "dependance",
        label: "Dépendance à un seul gros client maîtrisée (< 30 % du CA)",
        phase: "structuration",
        evaluate: (c) => scaleStatus(c.finDependance),
      },
      {
        id: "finances",
        label: "Santé financière lisible (marge connue)",
        phase: "structuration",
        evaluate: financeStatus,
      },
      {
        id: "capacite",
        label: "Capacité à livrer un volume accru",
        phase: "optimisation",
        evaluate: always("unknown"),
      },
    ],
  },
  alliance: {
    label: "prêt à approcher un partenaire stratégique",
    summary:
      "savoir précisément ce qu'on cherche chez un partenaire, une entreprise qui tourne sans son fondateur, et des documents clés mobilisables rapidement.",
    criteria: [
      {
        id: "actifs",
        label: "Offre et actifs mobilisables clairs",
        phase: "fondations",
        evaluate: offerStatus,
      },
      {
        id: "profil-partenaire",
        label: "Ce qu'on cherche chez un partenaire est défini",
        phase: "fondations",
        evaluate: always("unknown"),
      },
      {
        id: "sans-fondateur",
        label: "L'entreprise fonctionne sans le fondateur",
        phase: "structuration",
        evaluate: (c) => dimStatus(c.dims.independance),
      },
      {
        id: "docs-cles",
        label: "Documents clés prêts à montrer (finances, plan, organigramme)",
        phase: "optimisation",
        evaluate: (c) => (c.docFinances || c.docPlan || c.docOrg ? "met" : "unmet"),
      },
    ],
  },
  cession: {
    label: "dossier cédant prêt — vendable à sa juste valeur",
    summary:
      "un horizon clair, une valorisation estimée, une entreprise qui tourne sans le fondateur, une structure juridique propre, des bilans à jour et un plan de relève.",
    criteria: [
      {
        id: "horizon",
        label: "Horizon de cession défini (quand)",
        phase: "fondations",
        evaluate: always("unknown"),
      },
      {
        id: "structure",
        label: "Structure juridique propre (REQ, dirigeants, statuts)",
        phase: "fondations",
        evaluate: structureStatus,
      },
      {
        id: "independance",
        label: "L'entreprise fonctionne sans le fondateur",
        phase: "structuration",
        evaluate: (c) => dimStatus(c.dims.independance),
      },
      {
        id: "bilans",
        label: "3 derniers bilans disponibles et à jour",
        phase: "structuration",
        evaluate: (c) => (c.docFinances ? "met" : "unmet"),
      },
      {
        id: "valorisation",
        label: "Idée de la valeur de l'entreprise",
        phase: "optimisation",
        evaluate: always("unknown"),
      },
      {
        id: "releve",
        label: "Plan de relève / transition",
        phase: "optimisation",
        evaluate: always("unknown"),
      },
    ],
  },
  acquisition: {
    label: "prêt à évaluer une cible et faire une offre",
    summary:
      "une capacité de financement identifiée, des critères de cible précis (secteur, taille, géographie), et un socle financier et juridique propre pour porter l'acquisition.",
    criteria: [
      {
        id: "structure",
        label: "Structure juridique propre",
        phase: "fondations",
        evaluate: structureStatus,
      },
      {
        id: "criteres-cible",
        label: "Critères de cible définis (secteur, taille, géo)",
        phase: "fondations",
        evaluate: always("unknown"),
      },
      {
        id: "finances",
        label: "Santé financière solide pour porter l'opération",
        phase: "structuration",
        evaluate: financeStatus,
      },
      {
        id: "financement",
        label: "Capacité de financement identifiée",
        phase: "optimisation",
        evaluate: always("unknown"),
      },
    ],
  },
  structuration: {
    label: "fondations solides et cap clair",
    summary:
      "avoir nommé le problème principal, une offre claire, des finances lisibles et un socle juridique propre — la base avant tout objectif plus ambitieux.",
    criteria: [
      {
        id: "probleme",
        label: "Problème principal nommé",
        phase: "diagnostic",
        evaluate: always("unknown"),
      },
      { id: "offre", label: "Offre claire", phase: "fondations", evaluate: offerStatus },
      {
        id: "structure",
        label: "Structure juridique propre",
        phase: "fondations",
        evaluate: structureStatus,
      },
      {
        id: "finances",
        label: "Finances lisibles",
        phase: "structuration",
        evaluate: financeStatus,
      },
    ],
  },
  exploration: {
    label: "intention réelle clarifiée",
    summary:
      "faire émerger la vraie direction (vendre, s'allier, céder, acquérir, structurer) et le sommet du dirigeant à 5 ans, avant de jalonner un chemin.",
    criteria: [
      {
        id: "intention-reelle",
        label: "Direction réelle identifiée",
        phase: "diagnostic",
        evaluate: always("unknown"),
      },
      {
        id: "sommet",
        label: "Vision à 5 ans (le sommet) exprimée",
        phase: "diagnostic",
        evaluate: always("unknown"),
      },
    ],
  },
};

// ─────────────── Évaluation ───────────────

function buildEvalCtx(
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[]
): EvalCtx {
  const dims = submission.score?.dimensions ?? {};
  const finA = submission.answersBlocA ?? {};
  const matches = (re: RegExp) =>
    docs.some((d) => re.test(`${d.name} ${d.docType ?? ""}`) && d.analyzed);
  return {
    dims,
    hasOffre: Boolean(submission.siteUrl || submission.siteFallback?.offre),
    hasPublicCible: Boolean(submission.siteFallback?.publicCible),
    hasStructure: Boolean(submission.reqUrl || submission.reqFallback?.formeJuridique),
    finVisibilite: finA["fin-visibilite"],
    finDependance: finA["fin-dependance-client"],
    docFinances: matches(/financ|bilan|comptab|états? financ|revenus|marge|fiscal/i),
    docPlan: matches(/plan d'affaire|business plan|strat[ée]gi|pr[ée]visionnel/i),
    docOrg: matches(/organigramme|gouvernance|rel[èe]ve|actionnaire/i),
  };
}

/** Évalue la destination du dirigeant (point B + avancement). */
export function evaluateDestination(
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[] = []
): Destination | null {
  const intention = submission.intention;
  if (!intention) return null;
  const def = DESTINATIONS[intention];
  const ctx = buildEvalCtx(submission, docs);

  const criteria: DestinationCriterion[] = def.criteria.map((c) => ({
    id: c.id,
    label: c.label,
    phase: c.phase,
    status: c.evaluate(ctx),
  }));

  const metCount = criteria.filter((c) => c.status === "met").length;
  const partialCount = criteria.filter((c) => c.status === "partial").length;
  const total = criteria.length;
  const progressPct =
    total === 0 ? 0 : Math.round(((metCount + partialCount * 0.5) / total) * 100);

  return {
    intention,
    intentionLabel: INTENTION_LABELS[intention],
    label: def.label,
    summary: def.summary,
    criteria,
    metCount,
    total,
    progressPct,
  };
}
