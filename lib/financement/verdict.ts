/**
 * Diagnostic financement — construction du verdict.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * POINT D'INTÉGRATION DU FUTUR MOTEUR DE MATCHING
 *
 * `buildVerdict` est aujourd'hui un MOCK : il assemble un verdict
 * plausible à partir des réponses, sans interroger la base des 2 700
 * programmes (chantier séparé). Quand le vrai moteur existera, seule
 * cette fonction change — son type de retour (`Verdict`) est le contrat
 * que consomme l'interface (`verdict-panel.tsx`), qui n'a pas besoin de
 * savoir d'où viennent les données.
 *
 * Remplacement prévu : appel serveur (route handler ou server action)
 * qui reçoit `FinancementAnswers` et renvoie un `Verdict`.
 * ═══════════════════════════════════════════════════════════════════════
 */

import type { FinancementAnswers } from "./questions";

export type ProgrammeMatch = {
  nom: string;
  organisme: string;
  /** Ex. « jusqu'à 50 % du projet » — la règle de couverture du programme. */
  couverture: string;
  /** Pourquoi ce programme colle au profil — la phrase qu'Eden dirait. */
  angle: string;
};

export type Verdict = {
  /** Programmes où le profil a de réelles chances — pas la liste complète. */
  programmes: ProgrammeMatch[];
  /** Portion du projet qui peut être couverte, en clair. */
  portionFinancable: string;
  /** Fourchette chiffrée estimée. */
  montantEstime: { min: number; max: number };
  /** Ce qu'il faut préparer, dans l'ordre. */
  prochainesEtapes: string[];
};

/** Fourchettes mockées par ampleur de projet (réponse `investissement`). */
const MONTANTS: Record<string, { min: number; max: number }> = {
  "<25k": { min: 5_000, max: 15_000 },
  "25-100k": { min: 15_000, max: 60_000 },
  "100-500k": { min: 50_000, max: 250_000 },
  "500k+": { min: 150_000, max: 500_000 },
};

/** Programmes mockés par nature de projet (réponse `projet`). */
const PROGRAMMES: Record<string, ProgrammeMatch[]> = {
  rd: [
    {
      nom: "PARI-CNRC",
      organisme: "Conseil national de recherches Canada",
      couverture: "jusqu'à 80 % des salaires liés au projet",
      angle:
        "Votre projet d'innovation correspond au cœur du programme — c'est souvent la première porte pour la R&D en PME.",
    },
    {
      nom: "Crédit d'impôt RS&DE",
      organisme: "Gouvernements du Canada et du Québec",
      couverture: "jusqu'à 35 % des dépenses admissibles, remboursable",
      angle:
        "Se combine avec les autres aides : les dépenses de développement déjà engagées peuvent compter.",
    },
  ],
  equipement: [
    {
      nom: "ESSOR",
      organisme: "Investissement Québec",
      couverture: "prêt ou garantie jusqu'à 50 % du projet",
      angle:
        "Conçu pour les projets d'investissement qui augmentent la productivité — la modernisation d'équipements en est le cas type.",
    },
    {
      nom: "Audit industrie 4.0",
      organisme: "Investissement Québec",
      couverture: "jusqu'à 50 % du diagnostic et du plan numérique",
      angle:
        "L'étape qui précède : faire financer l'analyse avant de faire financer l'équipement.",
    },
  ],
  marches: [
    {
      nom: "Programme Exportation (PEX)",
      organisme: "Ministère de l'Économie du Québec",
      couverture: "jusqu'à 50 % des dépenses de commercialisation hors Québec",
      angle:
        "Votre projet d'expansion correspond exactement au périmètre : études de marché, missions, adaptation de l'offre.",
    },
    {
      nom: "CanExport PME",
      organisme: "Gouvernement du Canada",
      couverture: "jusqu'à 50 %, entre 10 000 $ et 50 000 $ par projet",
      angle:
        "Cumulable avec le provincial pour couvrir la prospection de nouveaux marchés internationaux.",
    },
  ],
  equipe: [
    {
      nom: "Subvention salariale",
      organisme: "Services Québec",
      couverture: "une partie du salaire pendant l'intégration",
      angle:
        "Réduit le risque d'une embauche clé — le levier le plus rapide à activer de votre profil.",
    },
    {
      nom: "Programme de formation de la main-d'œuvre",
      organisme: "Commission des partenaires du marché du travail",
      couverture: "jusqu'à 50 % des coûts de formation admissibles",
      angle:
        "Former l'équipe en place compte aussi comme un projet finançable — souvent oublié.",
    },
  ],
};

const FALLBACK_PROGRAMMES: ProgrammeMatch[] = PROGRAMMES.rd;

export function buildVerdict(answers: FinancementAnswers): Verdict {
  // TODO(matching) : remplacer tout le corps de cette fonction par l'appel
  // au vrai moteur de scoring contre la base des programmes.
  const programmes = PROGRAMMES[answers.projet] ?? FALLBACK_PROGRAMMES;
  const montantEstime = MONTANTS[answers.investissement] ?? MONTANTS["25-100k"];

  return {
    programmes,
    portionFinancable:
      answers.revenus === "pre-revenus"
        ? "Même sans ventes, une part importante des coûts de développement peut être couverte — c'est le profil des deux cas réels ci-dessous."
        : "Selon les règles des programmes identifiés, entre le tiers et la moitié de votre projet peut être couvert par du financement non dilutif.",
    montantEstime,
    prochainesEtapes: [
      "Décrire le projet en une page : objectif, retombées, échéancier.",
      "Rassembler les états financiers des 2 derniers exercices.",
      "Valider l'admissibilité fine avec Eden, programme par programme.",
      "Préparer et déposer le dossier prioritaire — accompagné jusqu'au dépôt.",
    ],
  };
}

export function formatMontant(n: number): string {
  return `${new Intl.NumberFormat("fr-CA").format(n)} $`;
}
