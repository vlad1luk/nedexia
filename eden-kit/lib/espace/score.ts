/**
 * Calcul du score · spec Jérôme 25 mai 2026
 *
 * Formule :
 *   - Score d'une dimension = moyenne des réponses (1-3) × 100/3
 *   - Score global = somme pondérée renormalisée sur les dimensions répondues
 *     (les dimensions non répondues sont exclues du calcul, pas pénalisées
 *     par 0)
 *   - Affichage explicite : "score indicatif"
 */

import {
  ALL_BLOC_A,
  ALL_BLOC_B,
  ALL_BLOC_C,
  QUESTIONS_INTENTION,
  type Question,
} from "./questions";
import {
  DIMENSION_WEIGHTS,
  type DimensionId,
  type DiagnosticSubmission,
  type Intention,
  type Scale,
  type ScoreSnapshot,
  type Tier,
} from "./types";

// ─────────────── Outils ───────────────

function dimensionScoreFromAnswers(answers: Array<Scale | undefined>): number | null {
  const valides = answers.filter((a): a is Scale => typeof a === "number");
  if (valides.length === 0) return null;
  const avg = valides.reduce((acc, v) => acc + v, 0) / valides.length;
  return Math.round((avg * 100) / 3);
}

export function tierFromScore(score: number): Tier {
  if (score <= 30) return "rouge";
  if (score <= 55) return "orange";
  if (score <= 75) return "jaune";
  return "vert";
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Plafond des points d'élan (bonus issus des actions complétées). */
export const MAX_TASK_BONUS = 8;

/**
 * Applique des « points d'élan » au score brut d'un diagnostic.
 * Le snapshot renvoyé conserve la trace du score brut (`baseTotal`) et du
 * bonus, et recalcule le palier sur le total effectif.
 */
export function applyScoreBonus(
  base: ScoreSnapshot,
  bonus: number
): ScoreSnapshot {
  const b = Math.max(0, Math.min(MAX_TASK_BONUS, Math.round(bonus)));
  const baseTotal = base.baseTotal ?? base.total;
  const total = clampScore(baseTotal + b);
  return {
    ...base,
    baseTotal,
    bonus: b,
    total,
    tier: tierFromScore(total),
  };
}

/** Récupère les réponses d'une dimension à travers tous les blocs */
function collectAnswersForDimension(
  submission: DiagnosticSubmission,
  dimension: DimensionId
): Array<Scale | undefined> {
  const blocs: Array<[Question[], Record<string, Scale> | undefined]> = [
    [ALL_BLOC_A, submission.answersBlocA],
    [ALL_BLOC_B, submission.answersBlocB],
    [ALL_BLOC_C, submission.answersBlocC],
  ];

  const out: Array<Scale | undefined> = [];

  for (const [questions, ans] of blocs) {
    for (const q of questions) {
      if (q.dimension !== dimension) continue;
      out.push(ans?.[q.id]);
    }
  }

  // Questions spécifiques selon intention (écran 5)
  if (submission.intention && submission.answersIntention) {
    const qs = QUESTIONS_INTENTION[submission.intention];
    for (const q of qs) {
      if (q.dimension !== dimension) continue;
      out.push(submission.answersIntention[q.id]);
    }
  }

  // Signaux dérivés des écrans 2 et 3
  if (dimension === "structure") {
    if (submission.reqUrl) out.push(2); // lien fourni = preuve d'existence publique
    if (submission.reqFallback) {
      const annee = Number(submission.reqFallback.anneeCreation);
      if (!Number.isNaN(annee)) {
        const age = new Date().getFullYear() - annee;
        if (age >= 10) out.push(3);
        else if (age >= 5) out.push(2);
        else out.push(1);
      }
    }
  }
  if (dimension === "clarte") {
    if (submission.siteUrl) out.push(2); // site présenté = signal positif
    if (submission.siteFallback) {
      // Si l'utilisateur a pris la peine de remplir les 2 champs, on crédite
      const hasBoth =
        submission.siteFallback.offre.trim().length > 0 &&
        submission.siteFallback.publicCible.trim().length > 0;
      out.push(hasBoth ? 2 : 1);
    }
  }

  return out;
}

// ─────────────── Calcul principal ───────────────

export function calculateScore(submission: DiagnosticSubmission): ScoreSnapshot {
  const dimensions: Record<DimensionId, number | null> = {
    clarte: null,
    independance: null,
    finances: null,
    structure: null,
    reputation: null,
  };
  const dimensionsRepondues: DimensionId[] = [];

  (Object.keys(dimensions) as DimensionId[]).forEach((dim) => {
    const answers = collectAnswersForDimension(submission, dim);
    const score = dimensionScoreFromAnswers(answers);
    dimensions[dim] = score;
    if (score !== null) dimensionsRepondues.push(dim);
  });

  // Somme pondérée renormalisée sur les dimensions répondues
  let total = 0;
  if (dimensionsRepondues.length > 0) {
    const poidsTotal = dimensionsRepondues.reduce(
      (acc, d) => acc + DIMENSION_WEIGHTS[d],
      0
    );
    const sommeWeighted = dimensionsRepondues.reduce(
      (acc, d) => acc + (dimensions[d] ?? 0) * DIMENSION_WEIGHTS[d],
      0
    );
    total = Math.round(sommeWeighted / poidsTotal);
  }

  return {
    total,
    tier: tierFromScore(total),
    dimensions,
    dimensionsRepondues,
    calculatedAt: new Date().toISOString(),
  };
}

// ─────────────── Lecture selon intention (écran 6) ───────────────

export const TIER_MESSAGES: Record<Tier, string> = {
  rouge:
    "Voici votre première lecture. Plusieurs fondations sont à consolider — c'est normal et ce sont exactement les zones qu'on peut travailler ensemble.",
  orange:
    "Bonne base, avec des zones à renforcer. Vous n'êtes pas loin d'un profil solide.",
  jaune:
    "Votre entreprise est bien positionnée. Quelques optimisations et vous serez prêt pour des connexions qualifiées.",
  vert: "Votre entreprise est prête. On peut envisager le matchmaking et des partenariats sérieux.",
};

export const INTENTION_LECTURE: Record<Intention, string> = {
  commerce:
    "Pour développer vos ventes B2B, deux leviers comptent autant que le produit : la clarté du message et la diversification du portefeuille clients.",
  alliance:
    "Un partenariat stratégique solide se construit sur des bases lisibles : ce que vous offrez, ce que vous cherchez, ce que vous valez.",
  cession:
    "La cession se prépare 24 à 36 mois à l'avance. La valeur dépend autant de votre indépendance fondateur que de vos chiffres.",
  acquisition:
    "L'acquisition réussie part d'un profil cible précis et d'une capacité financière documentée. La discipline du processus compte plus que l'opportunité.",
  structuration:
    "Structurer la croissance, c'est d'abord clarifier les 3 priorités qui méritent vos efforts cette année.",
  exploration:
    "Avant de choisir une direction, regarder le niveau de préparation actuel évite les fausses pistes. Voici ce que je vois.",
};
