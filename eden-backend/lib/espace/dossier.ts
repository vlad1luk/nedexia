/**
 * Lecture du dossier entreprise à partir d'une soumission diagnostic.
 * Pas de logique métier lourde — juste ce qu'il faut pour afficher
 * score, synthèse et prochaines pistes d'enrichissement.
 */

import type {
  DiagnosticSubmission,
  DimensionId,
  Intention,
  ScoreSnapshot,
} from "./types";
import { DIMENSION_LABELS, INTENTION_LABELS } from "./types";

// ─────────────── Prochaine action ───────────────

const NEXT_ACTION_BY_DIMENSION: Record<DimensionId, string> = {
  clarte:
    "Clarifier votre offre et votre message : en une phrase, que vendez-vous et à qui ?",
  independance:
    "Réduire la dépendance au fondateur : documenter 2–3 processus clés et identifier un suppléant par fonction.",
  finances:
    "Consolider la visibilité financière : mettre à jour vos 3 dernières années de marge et diversifier la clientèle.",
  structure:
    "Structurer le socle juridique : fiche REQ à jour, dirigeants identifiés, statuts conformes.",
  reputation:
    "Renforcer la preuve sociale : collecter 3 témoignages clients et actualiser votre présence en ligne.",
};

const NEXT_ACTION_BY_INTENTION: Partial<Record<Intention, string>> = {
  commerce:
    "Priorité commerce : tester votre pitch B2B auprès de 3 prospects cibles cette semaine.",
  cession:
    "Priorité cession : établir une liste de documents clés (états financiers, contrats, organigramme) à préparer.",
  acquisition:
    "Priorité acquisition : formaliser votre profil cible (secteur, taille, géographie, budget).",
};

// ─────────────── Signaux documents (docs réels Supabase) ───────────────

/**
 * Vue minimale d'un document pour les dérivations du dossier (complétude,
 * checklist, recommandations). Évite à `lib` de dépendre des types `app`.
 */
export type DossierDocSignal = {
  name: string;
  docType: string | null;
  analyzed: boolean;
};

/** Vrai si un document (nom ou type détecté par Eden) correspond au motif. */
function hasDocMatching(docs: DossierDocSignal[], re: RegExp): boolean {
  return docs.some((d) => re.test(`${d.name} ${d.docType ?? ""}`));
}

const RE_FINANCES = /financ|bilan|comptab|états? financ|revenus|marge|fiscal|t1|t2|ca\b/i;
const RE_PLAN = /plan d'affaire|plan d affaire|business plan|strat[ée]gi|pr[ée]visionnel/i;
const RE_ORG = /organigramme|gouvernance|organisation|rel[èe]ve|actionnaire/i;

/**
 * Quels documents-clés sont couverts par les docs fournis (utilisable côté
 * client pour recalculer complétude/checklist en direct après un upload).
 */
export function coveredDocRequirements(docs: DossierDocSignal[]): {
  finances: boolean;
  plan: boolean;
  organigramme: boolean;
} {
  return {
    finances: hasDocMatching(docs, RE_FINANCES),
    plan: hasDocMatching(docs, RE_PLAN),
    organigramme: hasDocMatching(docs, RE_ORG),
  };
}

export function getWeakestDimension(
  score: ScoreSnapshot
): DimensionId | null {
  let weakest: DimensionId | null = null;
  let minScore = Infinity;

  for (const id of score.dimensionsRepondues) {
    const value = score.dimensions[id];
    if (value !== null && value < minScore) {
      minScore = value;
      weakest = id;
    }
  }

  return weakest;
}

export function getNextAction(submission: DiagnosticSubmission): string {
  const intention = submission.intention;
  if (intention && NEXT_ACTION_BY_INTENTION[intention]) {
    return NEXT_ACTION_BY_INTENTION[intention]!;
  }

  if (submission.score) {
    const weakest = getWeakestDimension(submission.score);
    if (weakest) return NEXT_ACTION_BY_DIMENSION[weakest];
  }

  return "Revenez enrichir votre dossier pour affiner le score et débloquer des recommandations plus précises.";
}

// ─────────────── Enrichissements possibles ───────────────

export type EnrichmentItem = {
  id: string;
  title: string;
  description: string;
  /** done = déjà fourni · missing = manquant · soon = prochaine version */
  status: "done" | "missing" | "soon";
};

export function getEnrichmentItems(
  submission: DiagnosticSubmission
): EnrichmentItem[] {
  const items: EnrichmentItem[] = [];

  // REQ
  if (submission.reqUrl) {
    items.push({
      id: "req-url",
      title: "Fiche REQ",
      description: "Lien enregistré — analyse automatique à venir.",
      status: "done",
    });
  } else if (submission.reqFallback) {
    items.push({
      id: "req-manual",
      title: "Structure juridique (manuel)",
      description: `${submission.reqFallback.formeJuridique} · depuis ${submission.reqFallback.anneeCreation}`,
      status: "done",
    });
  } else {
    items.push({
      id: "req-missing",
      title: "Fiche REQ",
      description: "Ajouter le lien REQ pour évaluer la structure juridique.",
      status: "missing",
    });
  }

  // Site
  if (submission.siteUrl) {
    items.push({
      id: "site-url",
      title: "Site web",
      description: "Lien enregistré — lecture de l'offre à venir.",
      status: "done",
    });
  } else if (submission.siteFallback) {
    items.push({
      id: "site-manual",
      title: "Offre (manuel)",
      description: submission.siteFallback.offre,
      status: "done",
    });
  } else if (!submission.siteSkipped) {
    items.push({
      id: "site-missing",
      title: "Site web ou offre",
      description: "Décrire votre offre pour affiner la clarté stratégique.",
      status: "missing",
    });
  } else {
    items.push({
      id: "site-skipped",
      title: "Site web",
      description: "Étape passée — vous pourrez l'ajouter plus tard.",
      status: "missing",
    });
  }

  // Document
  if (submission.uploadedFile) {
    items.push({
      id: "doc-uploaded",
      title: "Document téléversé",
      description: `${submission.uploadedFile.name} — analyse à venir.`,
      status: "done",
    });
  } else {
    items.push({
      id: "doc-missing",
      title: "États financiers",
      description: "Téléverser un PDF pour affiner la dimension Finances.",
      status: "soon",
    });
  }

  // Dimensions non évaluées
  const dims = submission.score?.dimensions;
  if (dims?.structure === null) {
    items.push({
      id: "dim-structure",
      title: "Structure juridique",
      description: "Dimension partiellement évaluée — compléter via REQ ou questions.",
      status: "missing",
    });
  }

  return items;
}

// ─────────────── Complétude du dossier ───────────────

export type CompletenessItem = {
  id: string;
  label: string;
  done: boolean;
};

export type Completeness = {
  pct: number;
  filled: number;
  total: number;
  items: CompletenessItem[];
};

/**
 * Mesure la complétude du dossier sur les grands blocs de données.
 * Sert à montrer au dirigeant ce qu'il reste à fournir pour un score précis.
 */
export function getDossierCompleteness(
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[] = []
): Completeness {
  const hasFinancialDoc =
    Boolean(submission.uploadedFile) || hasDocMatching(docs, RE_FINANCES);
  const items: CompletenessItem[] = [
    { id: "intention", label: "Objectif défini", done: Boolean(submission.intention) },
    {
      id: "structure",
      label: "Structure juridique",
      done: Boolean(submission.reqUrl || submission.reqFallback),
    },
    {
      id: "offre",
      label: "Offre & positionnement",
      done: Boolean(submission.siteUrl || submission.siteFallback),
    },
    {
      id: "finances",
      label: "Santé financière",
      done: Boolean(
        submission.answersBlocA &&
          Object.keys(submission.answersBlocA).length > 0
      ),
    },
    {
      id: "independance",
      label: "Indépendance",
      done: Boolean(
        submission.answersBlocB &&
          Object.keys(submission.answersBlocB).length > 0
      ),
    },
    {
      id: "reputation",
      label: "Réputation",
      done: Boolean(
        submission.answersBlocC &&
          Object.keys(submission.answersBlocC).length > 0
      ),
    },
    {
      id: "documents",
      label: "Documents financiers",
      done: hasFinancialDoc,
    },
  ];

  const filled = items.filter((i) => i.done).length;
  const total = items.length;
  return {
    pct: Math.round((filled / total) * 100),
    filled,
    total,
    items,
  };
}

// ─────────────── Phases d'accompagnement ───────────────

export type AccompPhase = { id: string; title: string; summary: string };

/** Parcours d'accompagnement Nedexia — structure produit (affinée par Eden). */
export const ACCOMP_PHASES: AccompPhase[] = [
  {
    id: "diagnostic",
    title: "Diagnostic",
    summary: "Première lecture de votre niveau de préparation.",
  },
  {
    id: "fondations",
    title: "Fondations",
    summary: "Solidifier la structure juridique et clarifier l'offre.",
  },
  {
    id: "structuration",
    title: "Structuration",
    summary: "Réduire la dépendance au fondateur, fiabiliser les finances.",
  },
  {
    id: "optimisation",
    title: "Optimisation",
    summary: "Renforcer la réputation et préparer les opportunités.",
  },
  {
    id: "cercle",
    title: "Cercle Nedexia",
    summary: "Accès au réseau de partenariats qualifiés.",
  },
];

export type PhaseStatus = "done" | "current" | "upcoming";
export type RoadmapPhase = AccompPhase & { index: number; status: PhaseStatus };

export function getCurrentPhaseIndex(scoreTotal: number): number {
  if (scoreTotal >= 80) return 4;
  if (scoreTotal >= 60) return 3;
  if (scoreTotal >= 40) return 2;
  if (scoreTotal > 0) return 1;
  return 0;
}

export function getRoadmap(scoreTotal: number): {
  phases: RoadmapPhase[];
  currentIndex: number;
} {
  const currentIndex = getCurrentPhaseIndex(scoreTotal);
  const phases: RoadmapPhase[] = ACCOMP_PHASES.map((p, i) => ({
    ...p,
    index: i,
    status: i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming",
  }));
  return { phases, currentIndex };
}

// ─────────────── Recommandations (dérivées du score) ───────────────

export type RecoPriority = "haute" | "moyenne" | "info";
export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  priority: RecoPriority;
};

export function getRecommendations(
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[] = []
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (submission.score) {
    const weakest = getWeakestDimension(submission.score);
    if (weakest) {
      recs.push({
        id: `dim-${weakest}`,
        title: `Renforcer : ${DIMENSION_LABELS[weakest]}`,
        detail: NEXT_ACTION_BY_DIMENSION[weakest],
        priority: "haute",
      });
    }
  }

  for (const item of getDossierCompleteness(submission, docs).items) {
    if (!item.done) {
      recs.push({
        id: `miss-${item.id}`,
        title: `Compléter : ${item.label}`,
        detail:
          "Information manquante — la fournir précise votre score et débloque des conseils plus ciblés.",
        priority: "moyenne",
      });
    }
  }

  return recs;
}

// ─────────────── Documents demandés (référentiel) ───────────────

export type DocRequirement = {
  id: string;
  label: string;
  type: string;
  provided: boolean;
};

export function getDocumentChecklist(
  submission: DiagnosticSubmission,
  docs: DossierDocSignal[] = []
): DocRequirement[] {
  return [
    {
      id: "req",
      label: "Structure juridique (REQ)",
      type: "Juridique",
      provided: Boolean(submission.reqUrl || submission.reqFallback),
    },
    {
      id: "etats-financiers",
      label: "États financiers (3 ans)",
      type: "Finances",
      provided:
        Boolean(submission.uploadedFile) || hasDocMatching(docs, RE_FINANCES),
    },
    {
      id: "plan-affaires",
      label: "Plan d'affaires",
      type: "Stratégie",
      provided: hasDocMatching(docs, RE_PLAN),
    },
    {
      id: "organigramme",
      label: "Organigramme / gouvernance",
      type: "Gouvernance",
      provided: hasDocMatching(docs, RE_ORG),
    },
  ];
}

// ─────────────── Synthèse identité ───────────────

export function getDossierTitle(submission: DiagnosticSubmission): string {
  if (submission.reqFallback?.formeJuridique) {
    return `Dossier · ${submission.reqFallback.formeJuridique}`;
  }
  if (submission.siteFallback?.offre) {
    const offre = submission.siteFallback.offre;
    return offre.length > 48 ? `${offre.slice(0, 48)}…` : offre;
  }
  if (submission.intention) {
    return INTENTION_LABELS[submission.intention].split(" / ")[0];
  }
  return "Votre entreprise";
}

export function formatDossierDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
