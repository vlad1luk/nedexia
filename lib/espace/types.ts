/**
 * Modèle de données · Tunnel de diagnostic Nedexia (test MVP)
 *
 * Périmètre strict : on stocke uniquement ce qu'il faut pour calculer le
 * score et analyser les soumissions. Pas de dossier vivant, pas de workspace.
 */

// ─────────────── Intention (écran 1) ───────────────

export type Intention =
  | "commerce"
  | "alliance"
  | "cession"
  | "acquisition"
  | "structuration"
  | "exploration";

export const INTENTION_LABELS: Record<Intention, string> = {
  commerce: "Développer mes ventes / trouver des clients B2B",
  alliance: "Innover ou trouver un partenaire stratégique",
  cession: "Vendre ou transmettre mon entreprise",
  acquisition: "Acquérir ou reprendre une entreprise",
  structuration: "Structurer ma croissance, sans objectif précis encore",
  exploration: "Je ne sais pas encore",
};

export type IntentionPrecision = "croissance" | "stabilite" | "transition";

// ─────────────── REQ (écran 2) ───────────────

export type ReqFallback = {
  formeJuridique: string;
  anneeCreation: string;
  nbDirigeants: string;
};

// ─────────────── Site (écran 3) ───────────────

export type SiteFallback = {
  offre: string;
  publicCible: string;
};

// ─────────────── Échelle de réponse 1-3 ───────────────

export type Scale = 1 | 2 | 3;

// ─────────────── Dimensions (poids selon spec Jérôme) ───────────────

export type DimensionId =
  | "clarte"
  | "independance"
  | "finances"
  | "structure"
  | "reputation";

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  clarte: "Clarté stratégique",
  independance: "Indépendance",
  finances: "Santé financière",
  structure: "Structure juridique",
  reputation: "Réputation",
};

/** Pondération du score global · spec Jérôme 25 mai 2026 */
export const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  finances: 25,
  independance: 25,
  structure: 20,
  clarte: 15,
  reputation: 15,
};

// ─────────────── Score ───────────────

export type Tier = "rouge" | "orange" | "jaune" | "vert";

export const TIER_LABELS: Record<Tier, string> = {
  rouge: "À structurer",
  orange: "En progression",
  jaune: "Bien positionné",
  vert: "Référence",
};

export type ScoreSnapshot = {
  /** Score global /100 après pondération renormalisée (incluant le bonus d'élan) */
  total: number;
  tier: Tier;
  /** Score 0-100 par dimension (null si non répondue) */
  dimensions: Record<DimensionId, number | null>;
  /** Dimensions sur lesquelles au moins une question a été répondue */
  dimensionsRepondues: DimensionId[];
  calculatedAt: string;
  /** Score brut du diagnostic avant points d'élan (si bonus appliqué) */
  baseTotal?: number;
  /** Points d'élan gagnés via les actions complétées (0 si aucun) */
  bonus?: number;
};

// ─────────────── Soumission (ce qu'on persiste) ───────────────

export type DiagnosticSubmission = {
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  /** Numéro du dernier écran atteint (0–6) — drop-off tracking */
  reachedScreen: number;

  // Écran 1
  intention?: Intention;
  intentionPrecision?: IntentionPrecision;

  // Écran 2 — collage REQ ou fallback
  reqUrl?: string;
  reqSkipped?: boolean;
  reqFallback?: ReqFallback;

  // Écran 3 — collage site ou fallback
  siteUrl?: string;
  siteSkipped?: boolean;
  siteFallback?: SiteFallback;

  // Écran 4 — 9 questions (3 blocs A/B/C)
  answersBlocA?: Record<string, Scale>; // finances
  answersBlocB?: Record<string, Scale>; // indépendance
  answersBlocC?: Record<string, Scale>; // réputation
  /** Fichier téléversé (juste le nom + taille, pas analysé en V1 test) */
  uploadedFile?: { name: string; size: number };

  // Écran 5 — 1-2 questions selon intention
  answersIntention?: Record<string, Scale>;

  // Écran 6 — score + email
  score?: ScoreSnapshot;
  email?: string;

  /** Token opaque pour accéder au dossier sans compte (/espace/dossier/[token]) */
  accessToken?: string;
};
